/* eslint-disable max-classes-per-file */ // Necessary for in-line aggregate class

import { logger } from '@beanc16/logger';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { parseRegexByType, RegexLookupType } from '../../../../services/stringHelpers/stringHelpers.js';
import { EqualityOption } from '../../../shared/options/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import type { OnRowAbovePaginationButtonPressResponse } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { LookupMoveActionRowBuilder, LookupMoveCustomId } from '../../components/lookup/LookupMoveActionRowBuilder.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PokemonController } from '../../dal/PtuController.js';
import { getLookupMovesEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuMove } from '../../models/PtuMove.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuMovesSearchService } from '../../services/PtuMovesSearchService.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { GetLookupMoveDataParameters } from '../../types/modelParameters.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
    PtuMoveFrequency,
    PtuMoveListType,
} from '../../types/pokemon.js';
import { PtuLookupIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

interface GetOptionsResponse extends GetLookupMoveDataParameters
{
    includeContestStats?: boolean | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupMoveStrategy
{
    public static key: PtuLookupSubcommand.Move = PtuLookupSubcommand.Move;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<GetOptionsResponse>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        strategies: PtuStrategyMap,
        inputOptions?: Partial<GetOptionsResponse>,
    ): Promise<boolean>
    {
        // Get parameter results
        const options = this.getOptions(interaction as ButtonInteraction, inputOptions);

        // Get data
        const data = await this.getLookupData(options);

        // Get message
        const embeds = getLookupMovesEmbedMessages(data, {
            includeContestStats: (
                options.includeContestStats
                || options.contestStatType !== null
                || options.contestStatEffect !== null
            ),
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Move}`,
            noEmbedsErrorMessage: 'No moves were found.',
            ...(data.length === 1
                ? {
                    rowsAbovePagination: [
                        new LookupMoveActionRowBuilder({ basedOn: data[0].basedOn }),
                    ],
                    onRowAbovePaginationButtonPress: async (buttonInteraction) =>
                        await this.handleButtons(buttonInteraction as ButtonInteraction, strategies, data[0].name, data[0].basedOn),
                }
                : {}
            ),
        });
    }

    public static async getLookupData(input: GetLookupMoveDataParameters = { includeAllIfNoName: true }): Promise<PtuMove[]>
    {
        try
        {
            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: PtuLookupRange.Move,
            });

            const parsedInput = {
                ...input,
                names: input.names?.reduce<Set<string>>((acc, name) =>
                {
                    // Filter out nulls
                    if (name)
                    {
                        acc.add(name.toLowerCase());
                    }

                    return acc;
                }, new Set<string>()),
            };

            let beyondWeaponMovesAndManuevers = false;
            let output = data.reduce((acc, cur) =>
            {
                const element = new PtuMove(cur);

                if (!element.ShouldIncludeInOutput())
                {
                    return acc;
                }

                if (!element.IsValidBasedOnInput(parsedInput))
                {
                    return acc;
                }

                // Assume Arcane Fury marks the start of weapon moves, which are above maneuvers
                if (element.name.toLowerCase() === 'Arcane Fury'.toLowerCase())
                {
                    beyondWeaponMovesAndManuevers = true;
                }

                if (beyondWeaponMovesAndManuevers && parsedInput?.exclude?.weaponMovesAndManuevers)
                {
                    return acc;
                }

                acc.push(element);

                return acc;
            }, [] as PtuMove[]);

            // Sort manually if there's no searches
            if (parsedInput.nameSearch || parsedInput.rangeSearch || parsedInput.effectSearch)
            {
                const {
                    nameSearch,
                    rangeSearch,
                    effectSearch,
                } = parsedInput;

                const results = PtuMovesSearchService.search(output, parsedInput);

                const resultNames = new Set(results.filter(Boolean).map((element) => element.name.toLowerCase()));
                const manualResults = output.filter((element) =>
                {
                    // Only add items not already in the list
                    if (resultNames.has(element.name.toLowerCase()))
                    {
                        return false;
                    }

                    if (nameSearch && element.name.toLowerCase().includes(nameSearch.toLowerCase()))
                    {
                        return true;
                    }

                    if (rangeSearch && element.range && element.range.toLowerCase().includes(rangeSearch.toLowerCase()))
                    {
                        return true;
                    }

                    if (effectSearch && element.effects.toLowerCase().includes(effectSearch.toLowerCase()))
                    {
                        return true;
                    }

                    return false;
                });

                output = [
                    ...manualResults,
                    ...results,
                ];
            }

            // Filter out those not in the given movelist
            if (input.moveListType)
            {
                // Get query params
                const moveNames = output.map(({ name }) => name);
                const moveFindParams = PokemonController.getMoveListTypeSearchParams(moveNames, input.moveListType);
                const {
                    unwindPath,
                    matchStage,
                    groupField,
                } = this.getMoveListTypeAggregationConfig(moveNames, input.moveListType);

                // Get moves that are in the given movelist type
                const { results: [{ matchedMoves = [] }] = [{}] } = await PokemonController.aggregate([
                    // 1. Only look at pokemon that have at least one of the target moves
                    { $match: moveFindParams },
                    // 2. Flatten the array so each move becomes its own document
                    { $unwind: unwindPath },
                    // 3. Keep only the moves that are in the original input list
                    { $match: matchStage },
                    // 4. Collect the distinct matched move names
                    { $group: { _id: null, matchedMoves: { $addToSet: groupField } } },
                    // 5. (Optional) Remove null _id from the output
                    { $project: { _id: 0, matchedMoves: 1 } },
                ], {
                    // Custom mapping class for the aggregation
                    // (without this, it will attempt to map to PokemonController's default Model class)
                    Model: class
                    {
                        public matchedMoves: number;
                        constructor(params: { matchedMoves: number })
                        {
                            this.matchedMoves = params.matchedMoves;
                        }
                    },
                }) as { results: [{ matchedMoves: string[] }] };
                const matchedMovesSet = new Set(matchedMoves); // Set.has is faster than Array.includes

                // Only keep moves that are in the given movelist type
                output = output.filter((move) => matchedMovesSet.has(move.name));
            }

            return this.sortMoves(output, parsedInput);
        }

        catch (error)
        {
            logger.error('Failed to retrieve ptu moves', error);
            return [];
        }
    }

    public static sortMoves(moves: PtuMove[], { sortBy }: Pick<GetLookupMoveDataParameters, 'sortBy'> = {}): PtuMove[]
    {
        return moves.sort((a, b) =>
        {
            if (sortBy === 'name')
            {
                return a.name.localeCompare(b.name);
            }

            if (sortBy === 'type')
            {
                const result = a.type?.localeCompare(b.type ?? '');

                if (result)
                {
                    return result;
                }
            }

            /*
            * Sort by:
            * 1) Type
            * 2) Name
            */
            return a.type?.localeCompare(b.type ?? '')
                || a.name.localeCompare(b.name);
        });
    }

    private static async handleButtons(
        buttonInteraction: ButtonInteraction,
        strategies: PtuStrategyMap,
        moveName: string,
        basedOnMoveName: string | undefined,
    ): Promise<Pick<OnRowAbovePaginationButtonPressResponse, 'shouldUpdateMessage'>>
    {
        const handlerMap: Record<LookupMoveCustomId, () => Promise<boolean | undefined>> = {
            [LookupMoveCustomId.LookupPokemon]: async () => await strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.run(buttonInteraction, strategies, {
                moveName,
            }),
            [LookupMoveCustomId.LookupBasedOnMove]: async () => await this.run(buttonInteraction, strategies, {
                names: [...(basedOnMoveName ? [basedOnMoveName] : [])],
            }),
        };

        await buttonInteraction.deferReply({ fetchReply: true });
        await handlerMap[buttonInteraction.customId as LookupMoveCustomId]();

        return { shouldUpdateMessage: false };
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): GetOptionsResponse;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<GetOptionsResponse>): GetOptionsResponse;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction,
        options?: Partial<GetOptionsResponse>,
    ): GetOptionsResponse
    {
        if (options)
        {
            return {
                ...options,
            };
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const name = interaction.options.getString(PtuAutocompleteParameterName.MoveName);
        const type = interaction.options.getString('type') as PokemonType | null;
        const category = interaction.options.getString('category') as PokemonMoveCategory | null;
        const db = interaction.options.getInteger('damage_base');
        const dbEquality = interaction.options.getString('damage_base_equality') as EqualityOption;
        const frequency = interaction.options.getString('frequency') as PtuMoveFrequency | null;
        const ac = interaction.options.getInteger('ac');
        const acEquality = interaction.options.getString('ac_equality') as EqualityOption;
        const keywordName = interaction.options.getString(PtuAutocompleteParameterName.KeywordName);
        const moveListType = interaction.options.getString('move_list_type') as PtuMoveListType | null;
        const contestStatType = interaction.options.getString('contest_stat_type') as PtuContestStatType | null;
        const contestStatEffect = interaction.options.getString('contest_stat_effect') as PtuContestStatEffect | null;
        const includeContestStats = interaction.options.getBoolean('include_contest_stats');
        const basedOn = interaction.options.getString(PtuAutocompleteParameterName.BasedOnMove);
        const nameSearch = interaction.options.getString('name_search');
        const rangeSearch = interaction.options.getString('range_search');
        const effectSearch = interaction.options.getString('effect_search');

        return {
            names: [name],
            type,
            category,
            db,
            dbEquality,
            frequency,
            ac,
            acEquality,
            keywordName,
            moveListType,
            contestStatType,
            contestStatEffect,
            includeContestStats,
            basedOn,
            nameSearch,
            rangeSearch,
            effectSearch,
        };
    }

    public static getMoveListTypeAggregationConfig(moveNames: string[], moveListType: PtuMoveListType): {
        unwindPath: string;
        matchStage: Record<string, unknown>;
        groupField: string;
    }
    {
        const key = `moveList.${moveListType}`;
        let output: {
            unwindPath: string;
            matchStage: Record<string, unknown>;
            groupField: string;
        } = {
            unwindPath: `$${key}`,
            matchStage: {},
            groupField: `$${key}`,
        };

        switch (moveListType)
        {
            case PtuMoveListType.EggMoves:
            case PtuMoveListType.TutorMoves:
            case PtuMoveListType.ZygardeCubeMoves:
                output.matchStage = { [key]: { $in: moveNames } };
                break;
            case PtuMoveListType.TmHm:
                output.matchStage = {
                    [key]: parseRegexByType(moveNames, RegexLookupType.SubstringCaseInsensitive),
                };
                break;
            case PtuMoveListType.LevelUp:
                output = {
                    ...output,
                    matchStage: { [`${key}.move`]: { $in: moveNames } },
                    groupField: `$${key}.move`,
                };
                break;
            default:
                throw new Error(`Unknown move list type: ${moveListType}`);
        }

        return output;
    }
}
