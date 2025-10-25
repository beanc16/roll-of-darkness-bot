import { randomUUID, UUID } from 'node:crypto';

import { logger } from '@beanc16/logger';
import type { Entries } from '@beanc16/utility-types';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    type ChatInputCommandInteraction,
    type StringSelectMenuInteraction,
    type User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { RandomService } from '../../../../services/RandomService/RandomService.js';
import { RegexLookupType } from '../../../../services/stringHelpers/stringHelpers.js';
import { CommandName } from '../../../../types/discord.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import { InteractionListenerRestartStyle, InteractionStrategy } from '../../../strategies/InteractionStrategy/InteractionStrategy.js';
import { PaginationStrategy } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { HangmonActionRowBuilder, HangmonCustomIds } from '../../components/game/HangmonActionRowBuilder.js';
import { type HangmonEmbedField, HangmonEmbedMessage } from '../../components/game/HangmonEmbedMessage.js';
import { HangmonGameOverActionRowBuilder, HangmonGameOverCustomIds } from '../../components/game/HangmonGameOverActionRowBuilder.js';
import { HangmonGuessHistoryButton } from '../../components/game/HangmonGuessHistoryButton.js';
import { PtuPokemonCollection } from '../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../dal/PtuController.js';
import { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { PtuGameSubcommand } from '../../options/game.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import {
    HangmonPropertyHint,
    type HangmonState,
    HangmonVictoryState,
} from '../../types/hangmon.js';
import { PtuPokemon } from '../../types/pokemon.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

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

@staticImplements<PtuChatIteractionStrategy>()
export class HangmonStrategy extends BaseGenerateStrategy
{
    public static key: PtuGameSubcommand.Hangmon = PtuGameSubcommand.Hangmon;
    private static maxNumberOfPlayers = 6;
    private static maxNumberOfGuesses = 6;
    private static numOfHints = 5;
    private static guidToState: Record<UUID, HangmonState> = {};
    private static userIdToWinStreak: Record<string, number> = {};

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, rerunOptions?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, rerunOptions: {
        players: User[];
        commandName: CommandName;
    }): Promise<boolean>;
    public static async run(interaction: ChatInputCommandInteraction | ButtonInteraction, strategies: PtuStrategyMap, rerunOptions?: {
        players?: User[];
        commandName?: CommandName;
    }): Promise<boolean>
    {
        // Get data
        const players = (rerunOptions?.players) ? rerunOptions.players : this.getPlayers(interaction as ChatInputCommandInteraction);
        const { allPokemon, randomPokemon } = await this.getPokemon(strategies);

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
        this.guidToState[guid].allGuessEmbeds.push(embed);

        const activeGameAbortController = new AbortController();
        const commandName: CommandName = `/${rerunOptions?.commandName ?? (interaction as ChatInputCommandInteraction).commandName}`;
        const guessHistroyActionRowBuilder = new ActionRowBuilder<ButtonBuilder>({
            components: [
                new HangmonGuessHistoryButton(HangmonCustomIds.GuessHistory),
            ],
        });
        await interaction.editReply({
            embeds: [embed],
            components: [
                new HangmonActionRowBuilder({
                    message,
                    commandName,
                    embed,
                    state: this.guidToState[guid],
                    rowsBelowStringSelect: [guessHistroyActionRowBuilder],
                    onSelect: async (receivedInteraction, stringSelectActionRowBuilder) =>
                    {
                        if (!activeGameAbortController.signal.aborted)
                        {
                            await this.onSelectHandler({
                                receivedInteraction,
                                strategies,
                                stringSelectActionRowBuilder,
                                guid,
                                players,
                                activeGameAbortController,
                                commandName,
                            });
                        }
                    },
                }),
                guessHistroyActionRowBuilder,
            ],
        });

        return true;
    }

    private static async onSelectHandler({
        receivedInteraction,
        strategies,
        stringSelectActionRowBuilder,
        guid,
        players,
        activeGameAbortController,
        commandName,
    }: {
        receivedInteraction: StringSelectMenuInteraction;
        strategies: PtuStrategyMap;
        stringSelectActionRowBuilder: HangmonActionRowBuilder;
        guid: UUID;
        players: User[];
        activeGameAbortController: AbortController;
        commandName: CommandName;
    }): Promise<void>
    {
        if (receivedInteraction.customId === HangmonCustomIds.GuessHistory.toString())
        {
            await receivedInteraction.deferReply({ fetchReply: true, ephemeral: true });
            await this.sendGuessHistory({
                receivedInteraction,
                guid,
                commandName,
            });
            return;
        }

        // Only allow players to select
        if (!players.map((user) => user.id).includes(receivedInteraction.user.id))
        {
            await receivedInteraction.reply({
                content: 'Only players are allowed to select a guess.',
                ephemeral: true,
            });
            return;
        }

        // Defer update in case it takes too long
        const deferredResponse = await receivedInteraction.deferUpdate();

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
        this.guidToState[guid].allGuessEmbeds.push(embed);

        // Win & Loss
        if (
            state.victoryState === HangmonVictoryState.Win
            || state.victoryState === HangmonVictoryState.Loss
        )
        {
            // Get the correct pokemon's data with image url
            const [fullPokemonData] = await strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.getLookupData({
                name: state.correct.pokemon.name,
                lookupType: RegexLookupType.ExactMatchCaseInsensitive,
            }) as PtuPokemonForLookupPokemon[];

            // Update embed with correct pokemon's image
            if (fullPokemonData.metadata.imageUrl)
            {
                embed.setThumbnail(fullPokemonData.metadata.imageUrl);
            }

            // Update win streak and description as victory
            if (state.victoryState === HangmonVictoryState.Win)
            {
                const newUserIdToWinStreak: Record<string, number> = {};
                players.forEach((player) =>
                {
                    this.userIdToWinStreak[player.id] = (this.userIdToWinStreak[player.id] ?? 0) + 1;
                    newUserIdToWinStreak[player.id] = this.userIdToWinStreak[player.id];
                });

                embed.addWinStreak(newUserIdToWinStreak, 'set');
            }

            // Update win streak and description with correct pokemon's name
            if (state.victoryState === HangmonVictoryState.Loss)
            {
                const previousUserIdToWinStreak: Record<string, number> = {};
                embed.markAsLoss(state.correct.pokemon.name);

                players.forEach((player) =>
                {
                    previousUserIdToWinStreak[player.id] = 0 + (this.userIdToWinStreak[player.id] ?? 0);
                    this.userIdToWinStreak[player.id] = 0;
                });

                // Only add win streak if users had won at least once before
                if (!Object.values(previousUserIdToWinStreak).every((winCount) => winCount === 0))
                {
                    embed.addWinStreak(previousUserIdToWinStreak, 'add');
                }
            }

            const interactionResponse = await deferredResponse.edit({
                embeds: [embed],
                components: [
                    new HangmonGameOverActionRowBuilder(),
                ],
            });
            await InteractionStrategy.handleInteractions({
                interactionResponse,
                commandName,
                restartStyle: InteractionListenerRestartStyle.OnSuccess,
                onInteraction: async (newReceivedInteraction) =>
                {
                    const handlerMap: Record<HangmonGameOverCustomIds, () => Promise<boolean | void>> = {
                        [HangmonGameOverCustomIds.PlayAgain]: async () => await this.run(newReceivedInteraction as ButtonInteraction, strategies, {
                            players: players.some((player) => player.id === newReceivedInteraction.user.id)
                                ? players
                                : [newReceivedInteraction.user, ...players],
                            commandName,
                        }),
                        [HangmonGameOverCustomIds.LookupPokemon]: async () => await strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.run(newReceivedInteraction as ButtonInteraction, strategies, {
                            name: state.correct.pokemon.name,
                        }),
                        [HangmonGameOverCustomIds.GuessHistory]: async () => await this.sendGuessHistory({
                            receivedInteraction: newReceivedInteraction as ButtonInteraction,
                            guid,
                            commandName,
                        }),
                    };

                    await newReceivedInteraction.deferReply({
                        fetchReply: true,
                        ephemeral: new Set([
                            HangmonGameOverCustomIds.GuessHistory,
                        ]).has(newReceivedInteraction.customId as HangmonGameOverCustomIds),
                    });
                    const handler = handlerMap[newReceivedInteraction.customId as HangmonGameOverCustomIds];

                    // @ts-expect-error -- This could actually be undefined
                    if (handler)
                    {
                        activeGameAbortController.abort();
                    }

                    await handler();
                },
                getActionRowComponent: () => new HangmonGameOverActionRowBuilder(),
            });
            return;
        }

        // In Progress - update display and components
        stringSelectActionRowBuilder.update({ embed, state });
        await deferredResponse.edit({
            embeds: [embed],
            components: [
                stringSelectActionRowBuilder,
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new HangmonGuessHistoryButton(HangmonCustomIds.GuessHistory),
                    ],
                }),
            ],
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
    private static async getPokemon(strategies: PtuStrategyMap): Promise<GetPokemonResponse>
    {
        const allPokemon = await strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.getLookupData({ getAll: true }) as PtuPokemonForLookupPokemon[];
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
        return this.sortHints(hints);
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
            allGuessEmbeds: [],
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
        this.guidToState[guid].remainingPokemonOptions = results.map(pokemon => pokemon.toPtuPokemon()).sort((a, b) => a.name.localeCompare(b.name));
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
        else if (state.numOfGuesses >= this.maxNumberOfGuesses)
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

    private static sortHints(hints: HangmonPropertyHint[]): HangmonPropertyHint[];
    private static sortHints<Element extends { hint: HangmonPropertyHint }>(hintsData: Element[]): Element[];
    private static sortHints<Element extends { hint: HangmonPropertyHint }>(hintsData: HangmonPropertyHint[] | Element[]): HangmonPropertyHint[] | Element[]
    {
        // Get the index that each hint should be at in the sorted array
        const hintToIndex = Object.values(HangmonPropertyHint).reduce<Record<HangmonPropertyHint, number>>((acc, value, index) =>
        {
            acc[value] = index;
            return acc;
        }, {} as Record<HangmonPropertyHint, number>);

        // Sort so that hints are always in the same order across each game and guess
        return hintsData.sort((a, b) =>
        {
            const aValue = (typeof a === 'string') ? hintToIndex[a] : hintToIndex[a.hint];
            const bValue = (typeof b === 'string') ? hintToIndex[b] : hintToIndex[b.hint];
            return aValue - bValue;
        });
    }

    /* istanbul ignore next */
    private static async sendGuessHistory({
        receivedInteraction,
        guid,
        commandName,
    }: {
        receivedInteraction: ButtonInteraction | StringSelectMenuInteraction;
        guid: UUID;
        commandName: CommandName;
    }): Promise<void>
    {
        const { allGuessEmbeds } = this.guidToState[guid];

        await PaginationStrategy.run({
            originalInteraction: receivedInteraction,
            commandName,
            interactionType: 'editReply',
            embeds: allGuessEmbeds.map((embed) => embed.displayAttemptsInDescription()),
        });
    }
}
