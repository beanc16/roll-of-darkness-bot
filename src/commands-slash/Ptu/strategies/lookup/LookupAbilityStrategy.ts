import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuAbility } from '../../models/PtuAbility.js';
import { PtuAbilitiesSearchService } from '../../services/PtuAbilitiesSearchService.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { GetLookupAbilityDataParameters } from '../../types/modelParameters.js';

@staticImplements<ChatIteractionStrategy>()
export class LookupAbilityStrategy
{
    public static key: PtuLookupSubcommand.Ability = PtuLookupSubcommand.Ability;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.AbilityName);
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
        const embeds = getPagedEmbedMessages({
            input: abilities,
            title: 'Abilities',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.frequency !== undefined
                    ? [`Frequency: ${element.frequency}`]
                    : []
                ),
                ...(element.effect2 && element.effect2 !== '--'
                    ? [`Effect:\n\`\`\`\n${element.effect2}\`\`\``]
                    : ['']
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No abilities were found.',
        });
    }

    public static async getLookupData(input: GetLookupAbilityDataParameters = {}): Promise<PtuAbility[]>
    {
        try
        {
            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: PtuLookupRange.Ability,
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

            abilities.sort((a, b) => a.name.localeCompare(b.name));
            return abilities;
        }

        catch (error)
        {
            logger.error('Failed to retrieve ptu abilities', error);
            return [];
        }
    }
}
