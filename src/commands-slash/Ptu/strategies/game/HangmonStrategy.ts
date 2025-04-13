import { randomUUID, UUID } from 'node:crypto';

import {
    ActionRowBuilder,
    type ChatInputCommandInteraction,
    type StringSelectMenuInteraction,
    type User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { RandomService } from '../../../../services/RandomService.js';
import { PaginatedStringSelectMenu } from '../../../components/PaginatedStringSelectMenu.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { type HangmonEmbedField, HangmonEmbedMessage } from '../../components/game/HangmonEmbedMessage.js';
import type { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { PtuGameSubcommand } from '../../options/game.js';
import { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';

enum HangmonPropertyHint
{
    Name = 'Name',
    OneType = 'One Type',
    DexName = 'Pokédex Name',
    PtuSize = 'PTU Size',
    PtuWeightClass = 'PTU Weight Class',
    Habitat = 'Habitat',
    Diet = 'Diet',
    OneEggGroup = 'One Egg Group',
}

enum HangmonVictoryState
{
    Win = 'Win',
    Loss = 'Loss',
    InProgress = 'In Progress',
}

interface GetPokemonResponse
{
    allPokemon: PtuPokemonForLookupPokemon[];
    randomPokemon: PtuPokemonForLookupPokemon;
}

interface GetInitialHintsResponse
{
    hints: HangmonPropertyHint[];
    visibleHint: HangmonPropertyHint;
}

interface HangmonState
{
    numOfGuesses: number;
    victoryState: HangmonVictoryState;
    remainingPokemonOptions: PtuPokemonForLookupPokemon[];
    correct: {
        pokemon: PtuPokemonForLookupPokemon;
        hints: HangmonPropertyHint[];
    };
    incorrect: {
        pokemon: PtuPokemonForLookupPokemon[];
        hints: Record<HangmonPropertyHint, string[]>;
    };
}

@staticImplements<ChatIteractionStrategy>()
export class HangmonStrategy extends BaseGenerateStrategy
{
    public static key: PtuGameSubcommand.Hangmon = PtuGameSubcommand.Hangmon;
    private static maxNumberOfPlayers = 6;
    private static numOfHints = 5;
    private static guidToState: Record<UUID, HangmonState> = {};

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get data
        const players = this.getPlayers(interaction);
        const { allPokemon, randomPokemon } = await this.getPokemon();

        const message = await interaction.fetchReply();

        const { hints, visibleHint } = this.getInitialHints();
        const guid = this.initializeGameState({
            allPokemon,
            randomPokemon,
            hints,
            visibleHint,
        });

        // Build embed
        const fields = this.getEmbedFields(guid);
        const embed = new HangmonEmbedMessage({
            players,
            fields,
            maxAttempts: 6,
        });

        // TODO: Make it so only players can select options
        await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>>({
                    components: [new PaginatedStringSelectMenu({
                        customId: 'hangmon_selection',
                        elementName: 'Pokemon',
                        elements: this.guidToState[guid].remainingPokemonOptions,
                        message,
                        commandName: `/${interaction.commandName}`,
                        embeds: [embed],
                        onSelect: (receivedInteraction) => this.onSelectHandler(receivedInteraction, guid),
                        optionParser: (curPokemon) =>
                        {
                            const typesLabel = (curPokemon.types.length > 1) ? 'Types' : 'Type';

                            return {
                                label: curPokemon.name,
                                value: curPokemon.name,
                                description: [
                                    `${typesLabel}: ${curPokemon.types.join(' / ')}`,
                                    `${curPokemon.metadata.source}`,
                                ].join(' | '),
                            };
                        },
                    })],
                }),
            ],
        });

        return true;
    }

    private static onSelectHandler(receivedInteraction: StringSelectMenuInteraction, guid: UUID): void
    {
        // TODO: Do something here
        const state = this.guidToState[guid];
        const { customId, values: [value] = [] } = receivedInteraction;
        console.log('\n selected:', { customId, value }, '\n state:', state);
    }

    /* istanbul ignore next */
    private static getPlayers(interaction: ChatInputCommandInteraction): User[]
    {
        const players = [interaction.user];

        for (let index = 2; index <= this.maxNumberOfPlayers; index += 1)
        {
            const player = interaction.options.getUser(`player_${index}`);

            if (player)
            {
                players.push(player);
            }
        }

        return players;
    }

    /* istanbul ignore next */
    private static async getPokemon(): Promise<GetPokemonResponse>
    {
        const allPokemon = await LookupPokemonStrategy.getLookupData({ getAll: true });
        const index = RandomService.getRandomInteger(allPokemon.length);

        return {
            allPokemon,
            randomPokemon: allPokemon[index - 1],
        };
    }

    /* istanbul ignore next */
    private static getHintCategories(): HangmonPropertyHint[]
    {
        // Add mandatory hints
        const hints = [HangmonPropertyHint.Name];

        // Add possible required hints
        const minNumOfRequiredHints = 1;
        const possibleRequiredHints = [
            HangmonPropertyHint.OneType,
            HangmonPropertyHint.DexName,
        ];
        const requiredIndices = RandomService.getUniqueRandomIntegers(
            possibleRequiredHints.length,
            minNumOfRequiredHints,
        );
        requiredIndices.forEach(index => hints.push(possibleRequiredHints[index - 1]));

        // Add possible optional hints
        const possibleOptionalHints = Object.values(HangmonPropertyHint).filter(value => !hints.includes(value));
        const indices = RandomService.getUniqueRandomIntegers(
            possibleOptionalHints.length,
            this.numOfHints - minNumOfRequiredHints,
        );
        indices.forEach(index => hints.push(possibleOptionalHints[index - 1]));

        // Sort so that hints are always in the same order across each game
        const hintToIndex = Object.values(HangmonPropertyHint).reduce<Record<HangmonPropertyHint, number>>((acc, value, index) =>
        {
            acc[value] = index;
            return acc;
        }, {} as Record<HangmonPropertyHint, number>);
        return hints.sort((a, b) => hintToIndex[a] - hintToIndex[b]);
    }

    private static getStatFromHint(
        pokemon: PtuPokemonForLookupPokemon,
        hint: HangmonPropertyHint,
    ): string
    {
        const handlerMap: Record<HangmonPropertyHint, () => string> = {
            [HangmonPropertyHint.Name]: () => pokemon.name,
            [HangmonPropertyHint.OneType]: () =>
            {
                const index = RandomService.getRandomInteger(pokemon.types.length);
                return pokemon.types[index - 1];
            },
            [HangmonPropertyHint.PtuSize]: () => pokemon.sizeInformation.height.ptu,
            [HangmonPropertyHint.PtuWeightClass]: () => pokemon.sizeInformation.weight.ptu.toString(),
            [HangmonPropertyHint.Habitat]: () =>
            {
                const index = RandomService.getRandomInteger(pokemon.habitats.length);
                return pokemon.habitats[index - 1];
            },
            [HangmonPropertyHint.Diet]: () =>
            {
                const index = RandomService.getRandomInteger(pokemon.diets.length);
                return pokemon.diets[index - 1];
            },
            [HangmonPropertyHint.OneEggGroup]: () =>
            {
                const index = RandomService.getRandomInteger(pokemon.breedingInformation.eggGroups.length);
                return pokemon.breedingInformation.eggGroups[index - 1];
            },
            [HangmonPropertyHint.DexName]: () => pokemon.metadata.source,
        };

        return handlerMap[hint]();
    }

    private static getEmbedFields(guid: UUID): HangmonEmbedField[]
    {
        // eslint-disable-next-line newline-destructuring/newline
        const {
            correct: { pokemon, hints: correctHints },
            incorrect: { hints: incorrectHints },
        } = this.guidToState[guid];

        const hints = this.sortHints([
            ...correctHints.map(hint => ({
                hint,
                success: true,
            })),
            ...(Object.keys(incorrectHints) as HangmonPropertyHint[]).map(hint => ({
                hint,
                success: false,
            })),
        ]) as { hint: HangmonPropertyHint; success: boolean }[];

        return hints.map(({ hint, success }) => ({
            name: hint,
            value: (success)
                ? this.getStatFromHint(pokemon, hint)
                : '???',
            success,
        }));
    }

    /* istanbul ignore next */
    private static getInitialHints(): GetInitialHintsResponse
    {
        const hints = this.getHintCategories();

        // Exclude the first hint, which is always name
        const index = RandomService.getRandomInteger(hints.length - 1);

        return {
            hints,
            visibleHint: hints[index],
        };
    }

    /* istanbul ignore next */
    private static initializeGameState({
        allPokemon,
        randomPokemon,
        hints,
        visibleHint,
    }: GetPokemonResponse & GetInitialHintsResponse): UUID
    {
        const guid = randomUUID();

        const incorrectHints = hints.reduce<Record<HangmonPropertyHint, string[]>>((acc, value) =>
        {
            if (value === visibleHint)
            {
                return acc;
            }

            return {
                ...acc,
                [value]: [],
            };
        }, {} as Record<HangmonPropertyHint, string[]>);

        this.guidToState[guid] = {
            numOfGuesses: 0,
            victoryState: HangmonVictoryState.InProgress,
            remainingPokemonOptions: allPokemon,
            correct: {
                pokemon: randomPokemon,
                hints: [visibleHint],
            },
            incorrect: {
                pokemon: [],
                hints: incorrectHints,
            },
        };
        this.updateRemainingPokemonOptionsBasedOnHints(guid);

        return guid;
    }

    private static updateRemainingPokemonOptionsBasedOnHints(guid: UUID): void
    {
        const {
            remainingPokemonOptions,
            correct: { hints: correctHints, pokemon: correctPokemon },
            incorrect: { hints: incorrectHints },
        } = this.guidToState[guid];

        this.guidToState[guid].remainingPokemonOptions = remainingPokemonOptions.filter(pokemon =>
        {
            for (let index = 0; index < correctHints.length; index += 1)
            {
                if (this.getStatFromHint(pokemon, correctHints[index]) !== this.getStatFromHint(correctPokemon, correctHints[index]))
                {
                    return false;
                }
            }

            const incorrectHintEntries = Object.entries(incorrectHints);
            for (let index = 0; index < incorrectHintEntries.length; index += 1)
            {
                const [hint, values] = incorrectHintEntries[index] as [HangmonPropertyHint, string[]];

                if (values.includes(this.getStatFromHint(pokemon, hint)))
                {
                    return false;
                }
            }

            return true;
        });
    }

    private static sortHints<Element extends { hint: HangmonPropertyHint }>(hintsData: Element[]): { hint: HangmonPropertyHint }[]
    {
        // Sort so that hints are always in the same order across each game and guess
        const hintToIndex = Object.values(HangmonPropertyHint).reduce<Record<HangmonPropertyHint, number>>((acc, value, index) =>
        {
            acc[value] = index;
            return acc;
        }, {} as Record<HangmonPropertyHint, number>);

        return hintsData.sort((a, b) => hintToIndex[a.hint] - hintToIndex[b.hint]);
    }
}
