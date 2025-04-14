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
import type { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { PtuGameSubcommand } from '../../options/game.js';
import {
    HangmonPropertyHint,
    type HangmonState,
    HangmonVictoryState,
} from '../../types/hangmon.js';
import { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';

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

        this.addGuessToState(guid, guessedPokemonName);
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
        pokemon: PtuPokemonForLookupPokemon,
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
            [HangmonPropertyHint.Habitat]: () =>
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
            [HangmonPropertyHint.Diet]: () =>
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

    private static statsAreEqualForHint(
        pokemon1: PtuPokemonForLookupPokemon,
        pokemon2: PtuPokemonForLookupPokemon,
        hint: HangmonPropertyHint,
    ): boolean;
    private static statsAreEqualForHint(
        pokemon1: PtuPokemonForLookupPokemon,
        incorrectGuesses: string[],
        hint: HangmonPropertyHint,
    ): boolean;
    private static statsAreEqualForHint(
        pokemon1: PtuPokemonForLookupPokemon,
        pokemon2OrIncorrectGuesses: PtuPokemonForLookupPokemon | string[],
        hint: HangmonPropertyHint,
    ): boolean
    {
        const pokemon2 = (Array.isArray(pokemon2OrIncorrectGuesses))
            ? undefined
            : pokemon2OrIncorrectGuesses;
        const incorrectGuesses = (Array.isArray(pokemon2OrIncorrectGuesses))
            ? pokemon2OrIncorrectGuesses
            : [];

        const handlerMap: Record<HangmonPropertyHint, () => boolean> = {
            [HangmonPropertyHint.Name]: () => (pokemon2)
                ? pokemon1.name === pokemon2?.name
                : incorrectGuesses.includes(pokemon1.name),
            [HangmonPropertyHint.OneType]: () => pokemon1.types.some(element =>
                (pokemon2?.types ?? incorrectGuesses).includes(element),
            ),
            [HangmonPropertyHint.PtuSize]: () => (pokemon2)
                ? pokemon1.sizeInformation.height.ptu === pokemon2.sizeInformation.height.ptu
                : incorrectGuesses.includes(pokemon1.sizeInformation.height.ptu),
            [HangmonPropertyHint.PtuWeightClass]: () => (pokemon2)
                ? pokemon1.sizeInformation.weight.ptu === pokemon2.sizeInformation.weight.ptu
                : incorrectGuesses.includes(pokemon1.sizeInformation.weight.ptu.toString()),
            [HangmonPropertyHint.Habitat]: () => pokemon1.habitats.some(element =>
                (pokemon2?.habitats ?? incorrectGuesses).includes(element),
            ),
            [HangmonPropertyHint.Diet]: () => pokemon1.diets.some(element =>
                (pokemon2?.diets ?? incorrectGuesses).includes(element),
            ),
            [HangmonPropertyHint.OneEggGroup]: () => pokemon1.breedingInformation.eggGroups.some(element =>
                (pokemon2?.breedingInformation.eggGroups ?? incorrectGuesses).includes(element),
            ),
            [HangmonPropertyHint.DexName]: () => (pokemon2)
                ? pokemon1.metadata.source === pokemon2.metadata.source
                : incorrectGuesses.includes(pokemon1.metadata.source),
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
                value: undefined,
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
            value: (success)
                ? this.getRandomStatFromHint(pokemon, hint)
                : value ?? '???',
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
                if (!this.statsAreEqualForHint(correctPokemon, pokemon, correctHints[index]))
                {
                    return false;
                }
            }

            const incorrectHintEntries = Object.entries(incorrectHints) as Entries<Record<HangmonPropertyHint, string[]>>;
            for (let index = 0; index < incorrectHintEntries.length; index += 1)
            {
                const [hint, incorrectGuesses] = incorrectHintEntries[index];

                if (this.statsAreEqualForHint(pokemon, incorrectGuesses, hint))
                {
                    return false;
                }
            }

            return true;
        });
    }

    private static addGuessToState(guid: UUID, guessedPokemonName: string): void
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
        this.updateRemainingPokemonOptionsBasedOnHints(guid);
    }

    private static setCorrectAndIncorrectHints(guid: UUID, guessedPokemon: PtuPokemonForLookupPokemon): void
    {
        // eslint-disable-next-line newline-destructuring/newline
        const {
            correct: { pokemon: correctPokemon, hints: correctHints },
            incorrect: { hints: incorrectHints },
        } = this.guidToState[guid];

        [...correctHints, ...(Object.keys(incorrectHints) as HangmonPropertyHint[])].reduce((acc, hint) =>
        {
            if (
                this.statsAreEqualForHint(correctPokemon, guessedPokemon, hint)
                && !this.guidToState[guid].correct.hints.includes(hint)
            )
            {
                this.guidToState[guid].correct.hints.push(hint);
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
