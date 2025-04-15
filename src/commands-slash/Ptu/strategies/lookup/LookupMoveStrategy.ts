import { logger } from '@beanc16/logger';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { EqualityOption } from '../../../options/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import type { OnRowAbovePaginationButtonPressResponse } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { LookupMoveActionRowBuilder, LookupMoveCustomId } from '../../components/lookup/LookupMoveActionRowBuilder.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
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
} from '../../types/pokemon.js';
import { PtuLookupIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupMoveStrategy
{
    public static key: PtuLookupSubcommand.Move = PtuLookupSubcommand.Move;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.MoveName);
        const type = interaction.options.getString('type') as PokemonType | null;
        const category = interaction.options.getString('category') as PokemonMoveCategory | null;
        const db = interaction.options.getInteger('damage_base');
        const dbEquality = interaction.options.getString('damage_base_equality') as EqualityOption;
        const frequency = interaction.options.getString('frequency') as PtuMoveFrequency | null;
        const ac = interaction.options.getInteger('ac');
        const acEquality = interaction.options.getString('ac_equality') as EqualityOption;
        const contestStatType = interaction.options.getString('contest_stat_type') as PtuContestStatType | null;
        const contestStatEffect = interaction.options.getString('contest_stat_effect') as PtuContestStatEffect | null;
        const includeContestStats = interaction.options.getBoolean('include_contest_stats');
        const basedOn = interaction.options.getString(PtuAutocompleteParameterName.BasedOn);
        const nameSearch = interaction.options.getString('name_search');
        const rangeSearch = interaction.options.getString('range_search');
        const effectSearch = interaction.options.getString('effect_search');

        const data = await this.getLookupData({
            names: [name],
            type,
            category,
            db,
            dbEquality,
            frequency,
            ac,
            acEquality,
            contestStatType,
            contestStatEffect,
            basedOn,
            nameSearch,
            rangeSearch,
            effectSearch,
        });

        // Get message
        const embeds = getLookupMovesEmbedMessages(data, {
            includeContestStats: (includeContestStats || contestStatType !== null || contestStatEffect !== null),
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Move}`,
            noEmbedsErrorMessage: 'No moves were found.',
            ...(data.length === 1
                ? {
                    rowsAbovePagination: [
                        new LookupMoveActionRowBuilder(),
                    ],
                    onRowAbovePaginationButtonPress: async (buttonInteraction) =>
                        await this.handleButtons(buttonInteraction as ButtonInteraction, strategies, data[0].name),
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
            const output = data.reduce((acc, cur) =>
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
            if (parsedInput.nameSearch || parsedInput.effectSearch)
            {
                const results = PtuMovesSearchService.search(output, parsedInput);
                return results;
            }

            output.sort((a, b) =>
            {
                if (parsedInput.sortBy === 'name')
                {
                    return a.name.localeCompare(b.name);
                }

                if (parsedInput.sortBy === 'type')
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
            return output;
        }

        catch (error)
        {
            logger.error('Failed to retrieve ptu moves', error);
            return [];
        }
    }

    private static async handleButtons(
        buttonInteraction: ButtonInteraction,
        strategies: PtuStrategyMap,
        moveName: string,
    ): Promise<Pick<OnRowAbovePaginationButtonPressResponse, 'shouldUpdateMessage'>>
    {
        const handlerMap: Record<LookupMoveCustomId, () => Promise<boolean | undefined>> = {
            [LookupMoveCustomId.LookupPokemon]: async () => await strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.run(buttonInteraction, strategies, {
                moveName,
            }),
        };

        await buttonInteraction.deferReply({ fetchReply: true });
        await handlerMap[buttonInteraction.customId as LookupMoveCustomId]();

        return { shouldUpdateMessage: false };
    }
}
