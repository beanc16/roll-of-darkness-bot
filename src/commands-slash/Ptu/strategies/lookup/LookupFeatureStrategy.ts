import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuFeature } from '../../types/PtuFeature.js';

export interface GetLookupFeatureDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupFeatureStrategy
{
    public static key: PtuLookupSubcommand.Feature = PtuLookupSubcommand.Feature;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.FeatureName, true);

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Features',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.tags !== undefined && element.tags !== '-'
                    ? [
                        `Tags: ${element.tags}`,
                    ]
                    : []
                ),
                ...(element.prerequisites !== undefined && element.prerequisites !== '-'
                    ? [
                        `Prerequisites: ${element.prerequisites}`,
                    ]
                    : []
                ),
                ...(element.frequencyAndAction !== undefined && element.frequencyAndAction !== '-'
                    ? [
                        `Frequency / Action: ${element.frequencyAndAction}`,
                    ]
                    : []
                ),
                ...(element.effect !== undefined && element.effect !== '--'
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No features were found.',
        });
    }

    private static async getLookupData(input: GetLookupFeatureDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuFeature[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Feature,
        });

        const output = data.reduce<PtuFeature[]>((acc, cur) =>
        {
            const element = new PtuFeature(cur);

            if (element.name.length === 0)
            {
                return acc;
            }

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name.toLowerCase() === element.name.toLowerCase()) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) => a.name.localeCompare(b.name));

        return output;
    }
}
