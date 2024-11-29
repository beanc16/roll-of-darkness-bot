import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { EqualityOption } from '../../../options/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getLookupMovesEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuMove } from '../../models/PtuMove.js';
import { PtuMovesSearchService } from '../../services/PtuMovesSearchService.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuCompleteParameterName } from '../../types/autcomplete.js';
import { GetLookupMoveDataParameters } from '../../types/modelParameters.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuMoveFrequency,
} from '../../types/pokemon.js';

@staticImplements<ChatIteractionStrategy>()
export class LookupMoveStrategy
{
    public static key: PtuLookupSubcommand.Move = PtuLookupSubcommand.Move;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuCompleteParameterName.MoveName);
        const type = interaction.options.getString('type') as PokemonType | null;
        const category = interaction.options.getString('category') as PokemonMoveCategory | null;
        const db = interaction.options.getInteger('damage_base');
        const dbEquality = interaction.options.getString('damage_base_equality') as EqualityOption;
        const frequency = interaction.options.getString('frequency') as PtuMoveFrequency | null;
        const ac = interaction.options.getInteger('ac');
        const acEquality = interaction.options.getString('ac_equality') as EqualityOption;
        const nameSearch = interaction.options.getString('name_search');
        const rangeSearch = interaction.options.getString('range_search');
        const effectSearch = interaction.options.getString('effect_search');

        const moves = await this.getLookupData({
            name,
            type,
            category,
            db,
            dbEquality,
            frequency,
            ac,
            acEquality,
            nameSearch,
            rangeSearch,
            effectSearch,
        });

        // Get message
        const embeds = getLookupMovesEmbedMessages(moves);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No moves were found.',
        });
    }

    public static async getLookupData(input: GetLookupMoveDataParameters = {}): Promise<PtuMove[]>
    {
        try
        {
            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: `'Moves Data'!A3:Z`,
            });

            let beyondWeaponMovesAndManuevers = false;
            const moves = data.reduce((acc, cur) =>
            {
                const move = new PtuMove(cur);

                if (!move.ShouldIncludeInOutput())
                {
                    return acc;
                }

                if (!move.IsValidBasedOnInput(input))
                {
                    return acc;
                }

                // Assume Arcane Fury marks the start of weapon moves, which are above maneuvers
                if (move.name.toLowerCase() === 'Arcane Fury'.toLowerCase())
                {
                    beyondWeaponMovesAndManuevers = true;
                }

                if (beyondWeaponMovesAndManuevers && input?.exclude?.weaponMovesAndManuevers)
                {
                    return acc;
                }

                acc.push(move);

                return acc;
            }, [] as PtuMove[]);

            // Sort manually if there's no searches
            if (input.nameSearch || input.effectSearch)
            {
                const results = PtuMovesSearchService.search(moves, input);
                return results;
            }

            moves.sort((a, b) =>
            {
                if (input.sortBy === 'name')
                {
                    return a.name.localeCompare(b.name);
                }

                if (input.sortBy === 'type')
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
            return moves;
        }

        catch (error)
        {
            logger.error('Failed to retrieve ptu moves', error);
            return [];
        }
    }
}
