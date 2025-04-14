import { randomUUID, UUID } from 'node:crypto';

import { logger } from '@beanc16/logger';
import type { Entries } from '@beanc16/utility-types';
import {
    type ChatInputCommandInteraction,
    type StringSelectMenuInteraction,
    type User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { RandomService } from '../../../../services/RandomService.js';
import { RegexLookupType } from '../../../../services/stringHelpers.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { HangmonActionRowBuilder } from '../../components/game/HangmonActionRowBuilder.js';
import { type HangmonEmbedField, HangmonEmbedMessage } from '../../components/game/HangmonEmbedMessage.js';
import { PtuPokemonCollection } from '../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../dal/PtuController.js';
import { PtuGameSubcommand } from '../../options/game.js';
import {
    HangmonPropertyHint,
    type HangmonState,
    HangmonVictoryState,
} from '../../types/hangmon.js';
import { PtuPokemon } from '../../types/pokemon.js';
import { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';

interface GetPokemonResponse
{
    allPokemon: PtuPokemon[];
    randomPokemon: PtuPokemon;
}

interface GetInitialHintsResponse
{
    hints: HangmonPropertyHint[];
    visibleHint: HangmonPropertyHint;
}

interface StatsAreEqualForHintResponse
{
    areEqual: boolean;
    stat?: string;
}

@staticImplements<ChatIteractionStrategy>()
export class HangmonStrategy extends BaseGenerateStrategy
{
    public static key: PtuGameSubcommand.Hangmon = PtuGameSubcommand.Hangmon;
    private static maxNumberOfPlayers = 6;
    private static maxNumberOfGuesses = 6;
    private static numOfHints = 5;
    private static guidToState: Record<UUID, HangmonState> = {};

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get data
        const players = this.getPlayers(interaction);
        const { allPokemon, randomPokemon } = await this.getPokemon();

        const message = await interaction.fetchReply();

        const { hints, visibleHint } = this.getInitialHints();
        const guid = await this.initializeGameState({
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
            maxAttempts: this.maxNumberOfGuesses,
        });

        await interaction.editReply({
            embeds: [embed],
            components: [
                new HangmonActionRowBuilder({
                    message,
                    commandName: `/${interaction.commandName}`,
                    embed,
                    state: this.guidToState[guid],
                    onSelect: async (receivedInteraction, actionRowBuilder) => await this.onSelectHandler({
                        receivedInteraction,
                        actionRowBuilder,
                        guid,
                        players,
                    }),
                }),
            ],
        });

        return true;
    }

    private static async onSelectHandler({
        receivedInteraction,
        actionRowBuilder,
        guid,
        players,
    }: {
        receivedInteraction: StringSelectMenuInteraction;
        actionRowBuilder: HangmonActionRowBuilder;
        guid: UUID;
        players: User[];
    }): Promise<void>
    {
        // Only allow players to select
        if (!players.map((user) => user.id).includes(receivedInteraction.user.id))
        {
            await receivedInteraction.reply({
                content: 'Only players are allowed to select a guess.',
                ephemeral: true,
            });
            return;
        }

        const { values: [guessedPokemonName] = [] } = receivedInteraction;

        await this.addGuessToState(guid, guessedPokemonName);
        const state = this.guidToState[guid];

        // Get new embed to display with updated game state
        const fields = this.getEmbedFields(guid);
        const embed = new HangmonEmbedMessage({
            players,
            fields,
            attempts: state.numOfGuesses,
            maxAttempts: this.maxNumberOfGuesses,
        });

        // Win & Loss
        if (
            state.victoryState === HangmonVictoryState.Win
            || state.victoryState === HangmonVictoryState.Loss
        )
        {
            // Get the correct pokemon's data with image url
            const [fullPokemonData] = await LookupPokemonStrategy.getLookupData({
                name: state.correct.pokemon.name,
                lookupType: RegexLookupType.ExactMatchCaseInsensitive,
            });

            // Update embed with correct pokemon's image
            if (fullPokemonData.metadata.imageUrl)
            {
                embed.setThumbnail(fullPokemonData.metadata.imageUrl);
            }

            // Update description as victory
            if (state.victoryState === HangmonVictoryState.Win)
            {
                embed.markAsVictory();
            }

            // Update description with correct pokemon's name
            if (state.victoryState === HangmonVictoryState.Loss)
            {
                embed.markAsLoss(state.correct.pokemon.name);
            }

            await receivedInteraction.update({
                embeds: [embed],
                components: [],
                // TODO: Include play again button
                // TODO: Include button that replies with a fully featured version of looking up that pokemon by name
            });
            return;
        }

        // In Progress - update display and components
        actionRowBuilder.update({ embed, state });
        await receivedInteraction.update({
            embeds: [embed],
            components: [actionRowBuilder],
        });
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

    private static getRandomStatFromHint(
        pokemon: PtuPokemon,
        hint: HangmonPropertyHint,
        { onlyNewStats = false, guid }: { onlyNewStats?: boolean; guid?: UUID } = {},
    ): string
    {
        const incorrectHints = (guid)
            ? this.guidToState[guid].incorrect.hints[hint]
            : undefined;

        const handlerMap: Record<HangmonPropertyHint, () => string> = {
            [HangmonPropertyHint.Name]: () => pokemon.name,
            [HangmonPropertyHint.OneType]: () =>
            {
                let index: number;

                if (onlyNewStats && guid)
                {
                    const remainingStats = pokemon.types.filter(element =>
                        !incorrectHints!.includes(element),
                    );

                    index = (remainingStats.length > 0)
                        ? RandomService.getUniqueRandomIntegers(
                            remainingStats.length,
                            1,
                        )[0]
                        : RandomService.getRandomInteger(pokemon.types.length);
                }
                else
                {
                    index = RandomService.getRandomInteger(pokemon.types.length);
                }

                return pokemon.types[index - 1];
            },
            [HangmonPropertyHint.PtuSize]: () => pokemon.sizeInformation.height.ptu,
            [HangmonPropertyHint.PtuWeightClass]: () => pokemon.sizeInformation.weight.ptu.toString(),
            [HangmonPropertyHint.OneHabitat]: () =>
            {
                let index: number;

                if (onlyNewStats && guid)
                {
                    const remainingStats = pokemon.habitats.filter(element =>
                        !incorrectHints!.includes(element),
                    );

                    index = (remainingStats.length > 0)
                        ? RandomService.getUniqueRandomIntegers(
                            remainingStats.length,
                            1,
                        )[0]
                        : RandomService.getRandomInteger(pokemon.habitats.length);
                }
                else
                {
                    index = RandomService.getRandomInteger(pokemon.habitats.length);
                }

                return pokemon.habitats[index - 1];
            },
            [HangmonPropertyHint.OneDiet]: () =>
            {
                let index: number;

                if (onlyNewStats && guid)
                {
                    const remainingStats = pokemon.diets.filter(element =>
                        !incorrectHints!.includes(element),
                    );

                    index = (remainingStats.length > 0)
                        ? RandomService.getUniqueRandomIntegers(
                            remainingStats.length,
                            1,
                        )[0]
                        : RandomService.getRandomInteger(pokemon.diets.length);
                }
                else
                {
                    index = RandomService.getRandomInteger(pokemon.diets.length);
                }

                return pokemon.diets[index - 1];
            },
            [HangmonPropertyHint.OneEggGroup]: () =>
            {
                let index: number;

                if (onlyNewStats && guid)
                {
                    const remainingStats = pokemon.breedingInformation.eggGroups.filter(element =>
                        !incorrectHints!.includes(element),
                    );

                    index = (remainingStats.length > 0)
                        ? RandomService.getUniqueRandomIntegers(
                            remainingStats.length,
                            1,
                        )[0]
                        : RandomService.getRandomInteger(pokemon.breedingInformation.eggGroups.length);
                }
                else
                {
                    index = RandomService.getRandomInteger(pokemon.breedingInformation.eggGroups.length);
                }

                return pokemon.breedingInformation.eggGroups[index - 1];
            },
            [HangmonPropertyHint.DexName]: () => pokemon.metadata.source,
        };

        return handlerMap[hint]();
    }

    private static getFirstEqualStatForHint(
        pokemon1: PtuPokemon,
        pokemon2: PtuPokemon,
        hint: HangmonPropertyHint,
    ): StatsAreEqualForHintResponse;
    private static getFirstEqualStatForHint(
        pokemon1: PtuPokemon,
        guesses: string[],
        hint: HangmonPropertyHint,
    ): StatsAreEqualForHintResponse;
    private static getFirstEqualStatForHint(
        pokemon1: PtuPokemon,
        pokemon2OrGuesses: PtuPokemon | string[],
        hint: HangmonPropertyHint,
    ): StatsAreEqualForHintResponse
    {
        const pokemon2 = (Array.isArray(pokemon2OrGuesses))
            ? undefined
            : pokemon2OrGuesses;
        const guesses = (Array.isArray(pokemon2OrGuesses))
            ? pokemon2OrGuesses
            : [];

        const handlerMap: Record<HangmonPropertyHint, () => string | undefined> = {
            [HangmonPropertyHint.Name]: () =>
            {
                if (pokemon2)
                {
                    if (pokemon1.name === pokemon2.name)
                    {
                        return pokemon1.name;
                    }
                }
                else
                {
                    return guesses.find((guess) => guess === pokemon1.name);
                }

                return undefined;
            },
            [HangmonPropertyHint.OneType]: () => pokemon1.types.find(element =>
                (pokemon2?.types ?? guesses).includes(element),
            ),
            [HangmonPropertyHint.PtuSize]: () =>
            {
                if (pokemon2)
                {
                    if (pokemon1.sizeInformation.height.ptu === pokemon2.sizeInformation.height.ptu)
                    {
                        return pokemon1.sizeInformation.height.ptu;
                    }
                }
                else
                {
                    return guesses.find((guess) => guess === pokemon1.sizeInformation.height.ptu);
                }

                return undefined;
            },
            [HangmonPropertyHint.PtuWeightClass]: () =>
            {
                if (pokemon2)
                {
                    if (pokemon1.sizeInformation.weight.ptu === pokemon2.sizeInformation.weight.ptu)
                    {
                        return pokemon1.sizeInformation.weight.ptu.toString();
                    }
                }
                else
                {
                    return guesses.find((guess) => guess === pokemon1.sizeInformation.weight.ptu.toString());
                }

                return undefined;
            },
            [HangmonPropertyHint.OneHabitat]: () => pokemon1.habitats.find(element =>
                (pokemon2?.habitats ?? guesses).includes(element),
            ),
            [HangmonPropertyHint.OneDiet]: () => pokemon1.diets.find(element =>
                (pokemon2?.diets ?? guesses).includes(element),
            ),
            [HangmonPropertyHint.OneEggGroup]: () => pokemon1.breedingInformation.eggGroups.find(element =>
                (pokemon2?.breedingInformation.eggGroups ?? guesses).includes(element),
            ),
            [HangmonPropertyHint.DexName]: () =>
            {
                if (pokemon2)
                {
                    if (pokemon1.metadata.source === pokemon2.metadata.source)
                    {
                        return pokemon1.metadata.source;
                    }
                }
                else
                {
                    return guesses.find((guess) => guess === pokemon1.metadata.source);
                }

                return undefined;
            },
        };

        const stat = handlerMap[hint]();

        return {
            areEqual: !!stat,
            stat,
        };
    }

    private static getEmbedFields(guid: UUID): HangmonEmbedField[]
    {
        // eslint-disable-next-line newline-destructuring/newline
        const {
            correct: { hints: correctHints },
            incorrect: { hints: incorrectHints },
        } = this.guidToState[guid];

        const hints = this.sortHints([
            ...(Object.entries(correctHints) as Entries<Record<HangmonPropertyHint, string>>).map(([hint, value]) => ({
                hint,
                value,
                success: true,
            })),
            ...(Object.entries(incorrectHints) as Entries<Record<HangmonPropertyHint, string[]>>).map(([hint, values]) => ({
                hint,
                value: values[values.length - 1],
                success: false,
            })),
        ]);

        return hints.map(({
            hint,
            value,
            success,
        }) => ({
            name: hint,
            value: value ?? '???',
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

    private static async initializeGameState({
        allPokemon,
        randomPokemon,
        hints,
        visibleHint,
    }: GetPokemonResponse & GetInitialHintsResponse): Promise<UUID>
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
                hints: {
                    [visibleHint]: this.getFirstEqualStatForHint(randomPokemon, randomPokemon, visibleHint).stat!,
                },
            },
            incorrect: {
                pokemon: [],
                hints: incorrectHints,
            },
        };
        await this.updateRemainingPokemonOptionsBasedOnHints(guid);

        return guid;
    }

    private static async updateRemainingPokemonOptionsBasedOnHints(guid: UUID): Promise<void>
    {
        // eslint-disable-next-line newline-destructuring/newline
        const {
            correct: { hints: correctHints },
            incorrect: { hints: incorrectHints },
        } = this.guidToState[guid];

        // Map each hint to the corresponding database key for filtering
        const hintToDbKey: Record<HangmonPropertyHint, string> = {
            [HangmonPropertyHint.Name]: 'name',
            [HangmonPropertyHint.OneType]: 'types',
            [HangmonPropertyHint.DexName]: 'metadata.source',
            [HangmonPropertyHint.PtuSize]: 'sizeInformation.height.ptu',
            [HangmonPropertyHint.PtuWeightClass]: 'sizeInformation.weight.ptu',
            [HangmonPropertyHint.OneHabitat]: 'habitats',
            [HangmonPropertyHint.OneDiet]: 'diets',
            [HangmonPropertyHint.OneEggGroup]: 'breedingInformation.eggGroups',
        };

        // Build the search parameters
        const searchParams: Record<string, { $in?: (string | number)[]; $nin?: (string | number)[] }> = {};

        (Object.entries(correctHints) as Entries<Record<HangmonPropertyHint, string>>).forEach(([hint, value]) =>
        {
            const parsedValue = (hint === HangmonPropertyHint.PtuWeightClass)
                ? parseInt(value, 10)
                : value;

            searchParams[hintToDbKey[hint]] = { $in: [parsedValue] };
        });

        (Object.entries(incorrectHints) as Entries<Record<HangmonPropertyHint, string[]>>).forEach(([hint, values]) =>
        {
            const parsedValues = (hint === HangmonPropertyHint.PtuWeightClass)
                ? values.map(value => parseInt(value, 10))
                : values;

            if (parsedValues.length > 0)
            {
                searchParams[hintToDbKey[hint]] = { $nin: parsedValues };
            }
        });

        // Get all pokemon that match the search parameters
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is safe based on knowledge of the consumed package
        const { results = [] } = await PokemonController.getAll(searchParams) as { results: PtuPokemonCollection[] };
        this.guidToState[guid].remainingPokemonOptions = results.map(pokemon => pokemon.toPtuPokemon());
    }

    private static async addGuessToState(guid: UUID, guessedPokemonName: string): Promise<void>
    {
        const state = this.guidToState[guid];

        if (state.victoryState !== HangmonVictoryState.InProgress)
        {
            const {
                remainingPokemonOptions: _,
                ...remainingState
            } = state;
            logger.warn('addGuessToState: Game is not in progress', {
                guid,
                ...remainingState,
                numOfRemainingPokemonOptions: state.remainingPokemonOptions.length,
            });
            return;
        }

        // Increment number of guesses
        this.guidToState[guid].numOfGuesses += 1;

        // Update game state if appropriate
        if (state.correct.pokemon.name === guessedPokemonName)
        {
            this.guidToState[guid].victoryState = HangmonVictoryState.Win;
        }
        if (state.numOfGuesses >= this.maxNumberOfGuesses)
        {
            this.guidToState[guid].victoryState = HangmonVictoryState.Loss;
        }

        // Mark guessed pokemon as incorrect
        const guessedPokemon = state.remainingPokemonOptions.find(pokemon => pokemon.name === guessedPokemonName)!;
        state.incorrect.pokemon.push(guessedPokemon);

        // Update game state's hints and remaining pokemon options
        this.setCorrectAndIncorrectHints(guid, guessedPokemon);
        await this.updateRemainingPokemonOptionsBasedOnHints(guid);
    }

    private static setCorrectAndIncorrectHints(guid: UUID, guessedPokemon: PtuPokemon): void
    {
        // eslint-disable-next-line newline-destructuring/newline
        const {
            correct: { pokemon: correctPokemon, hints: correctHints },
            incorrect: { hints: incorrectHints },
        } = this.guidToState[guid];

        const correctHintsKeys = Object.keys(correctHints) as HangmonPropertyHint[];

        [...correctHintsKeys, ...(Object.keys(incorrectHints) as HangmonPropertyHint[])].reduce((acc, hint) =>
        {
            const { areEqual, stat } = this.getFirstEqualStatForHint(correctPokemon, guessedPokemon, hint);

            if (areEqual && !correctHintsKeys.includes(hint))
            {
                this.guidToState[guid].correct.hints[hint] = stat!;
                delete this.guidToState[guid].incorrect.hints[hint];
            }
            else if (this.guidToState[guid].incorrect.hints[hint])
            {
                const guessedStat = this.getRandomStatFromHint(guessedPokemon, hint, {
                    guid,
                    onlyNewStats: true,
                });
                this.guidToState[guid].incorrect.hints[hint].push(guessedStat);
            }

            return acc;
        });
    }

    private static sortHints<Element extends { hint: HangmonPropertyHint }>(hintsData: Element[]): Element[]
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
