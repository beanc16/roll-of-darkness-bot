import {
    ActionRowBuilder,
    type ChatInputCommandInteraction,
    type User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { PaginatedStringSelectMenu } from '../../../components/PaginatedStringSelectMenu.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { type HangmonEmbedField, HangmonEmbedMessage } from '../../components/game/HangmonEmbedMessage.js';
import type { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { PtuGameSubcommand } from '../../options/game.js';
import { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';

// Always include name, then pick 5 others randomly
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

@staticImplements<ChatIteractionStrategy>()
export class HangmonStrategy extends BaseGenerateStrategy
{
    public static key: PtuGameSubcommand.Hangmon = PtuGameSubcommand.Hangmon;
    private static maxNumberOfPlayers = 6;
    private static numOfHints = 5;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get data
        const players = this.getPlayers(interaction);
        const { allPokemon, randomPokemon } = await this.getPokemon();

        // Build embed
        const embed = new HangmonEmbedMessage({
            user: interaction.user,
            players,
            fields: this.getEmbedFields(randomPokemon),
            maxAttempts: 6,
        });

        const message = await interaction.fetchReply();

        // TODO: Make it so only players can select options
        await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>>({
                    components: [new PaginatedStringSelectMenu({
                        customId: 'hangmon_selection',
                        elementName: 'Pokemon',
                        elements: allPokemon,
                        message,
                        commandName: `/${interaction.commandName}`,
                        embeds: [embed],
                        onSelect: (receivedInteraction) =>
                        {
                            // TODO: Do something here
                            const { customId, values: [value] = [] } = receivedInteraction;
                            console.log('\n selected:', { customId, value });
                        },
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
    private static async getPokemon(): Promise<{ allPokemon: PtuPokemonForLookupPokemon[]; randomPokemon: PtuPokemonForLookupPokemon }>
    {
        const allPokemon = await LookupPokemonStrategy.getLookupData({ getAll: true });

        const [index] = new DiceLiteService({
            count: 1,
            sides: allPokemon.length,
        }).roll();

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
        const [requiredIndex] = new DiceLiteService({
            count: minNumOfRequiredHints,
            sides: possibleRequiredHints.length,
        }).roll({ uniqueRolls: true });
        hints.push(possibleRequiredHints[requiredIndex - 1]);

        // Add possible optional hints
        const possibleOptionalHints = Object.values(HangmonPropertyHint).filter(value => !hints.includes(value));
        const indices = new DiceLiteService({
            count: this.numOfHints - minNumOfRequiredHints,
            sides: possibleOptionalHints.length,
        }).roll({ uniqueRolls: true });
        indices.forEach(index => hints.push(possibleOptionalHints[index - 1]));

        // Sort so that hints are always in the same order across each game
        const hintToIndex = Object.values(HangmonPropertyHint).reduce<Record<HangmonPropertyHint, number>>((acc, value, index) =>
        {
            acc[value] = index;
            return acc;
        }, {} as Record<HangmonPropertyHint, number>);
        return hints.sort((a, b) => hintToIndex[a] - hintToIndex[b]);
    }

    private static getEmbedFields(pokemon: PtuPokemonForLookupPokemon): HangmonEmbedField[]
    {
        const handlerMap: Record<HangmonPropertyHint, () => string> = {
            [HangmonPropertyHint.Name]: () => pokemon.name,
            [HangmonPropertyHint.OneType]: () =>
            {
                const [index] = new DiceLiteService({
                    count: 1,
                    sides: pokemon.types.length,
                }).roll();

                return pokemon.types[index - 1];
            },
            [HangmonPropertyHint.PtuSize]: () => pokemon.sizeInformation.height.ptu,
            [HangmonPropertyHint.PtuWeightClass]: () => pokemon.sizeInformation.weight.ptu.toString(),
            [HangmonPropertyHint.Habitat]: () =>
            {
                const [index] = new DiceLiteService({
                    count: 1,
                    sides: pokemon.habitats.length,
                }).roll();

                return pokemon.habitats[index - 1];
            },
            [HangmonPropertyHint.Diet]: () =>
            {
                const [index] = new DiceLiteService({
                    count: 1,
                    sides: pokemon.diets.length,
                }).roll();

                return pokemon.diets[index - 1];
            },
            [HangmonPropertyHint.OneEggGroup]: () =>
            {
                const [index] = new DiceLiteService({
                    count: 1,
                    sides: pokemon.breedingInformation.eggGroups.length,
                }).roll();

                return pokemon.breedingInformation.eggGroups[index - 1];
            },
            [HangmonPropertyHint.DexName]: () => pokemon.metadata.source,
        };

        const hints = this.getHintCategories();

        // TODO: Handle hidden/visible properties later
        return hints.map(hint => ({
            name: hint,
            value: handlerMap[hint](),
            success: true,
        }));
    }
}
