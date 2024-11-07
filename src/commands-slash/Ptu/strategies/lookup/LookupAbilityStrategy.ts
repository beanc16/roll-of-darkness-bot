import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { PtuAbilitiesSearchService } from '../../services/PtuAbilitiesSearchService.js';
import { getLookupAbilitiesEmbedMessages } from '../../../Ptu/embed-messages/lookup.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { PtuAbility } from '../../models/PtuAbility.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { logger } from '@beanc16/logger';

export interface GetLookupAbilityDataParameters
{
    name?: string | null;
    nameSearch?: string | null;
    frequencySearch?: string | null;
    effectSearch?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupAbilityStrategy
{
    public static key = PtuLookupSubcommand.Ability;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('ability_name');
        const nameSearch = interaction.options.getString('name_search');
        const frequencySearch = interaction.options.getString('frequency_search');
        const effectSearch = interaction.options.getString('effect_search');

        const abilities = await this.getLookupData({
            name,
            nameSearch,
            frequencySearch,
            effectSearch,
        });

        // Get message
        const embeds = getLookupAbilitiesEmbedMessages(abilities);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No abilities were found.',
        });
    }

    public static async getLookupData(input: GetLookupAbilityDataParameters = {})
    {
        try
        {
            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: `'Abilities Data'!A3:Z`,
            });

            const abilities = data.reduce<PtuAbility[]>((acc, cur) =>
            {
                const ability = new PtuAbility(cur);

                if (!ability.IsValidBasedOnInput(input))
                {
                    return acc;
                }

                acc.push(ability);

                return acc;
            }, []);

            // Sort manually if there's no searches
            if (input.nameSearch || input.effectSearch)
            {
                const results = PtuAbilitiesSearchService.search(abilities, input);
                return results;
            }

            abilities.sort((a, b) =>
            {
                /*
                * Sort by:
                * 1) Name
                */
                return a.name.localeCompare(b.name);
            });
            return abilities;
        }

        catch (error)
        {
            logger.error('Failed to retrieve ptu abilities', error);
            return [];
        }
    }
}
