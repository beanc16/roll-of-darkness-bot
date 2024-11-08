import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { getLookupFeaturesEmbedMessages } from '../../embed-messages/lookup.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { PtuFeature } from '../../models/PtuFeature.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';

export interface GetLookupFeatureDataParameters
{
    name?: string | null;
    includeAllIfNoName?: boolean;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupFeatureStrategy
{
    public static key = PtuLookupSubcommand.Feature;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('feature_name', true);

        const features = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupFeaturesEmbedMessages(features);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No features were found.',
        });
    }

    private static async getLookupData(input: GetLookupFeatureDataParameters = {
        includeAllIfNoName: true,
    })
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Features Data'!A2:Z`,
        });

        const features = data.reduce<PtuFeature[]>((acc, cur) =>
        {
            const feature = new PtuFeature(cur);

            if (feature.name.length === 0)
            {
                return acc;
            }

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name.toLowerCase() === feature.name.toLowerCase()) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(feature);
            return acc;
        }, []);

        // Sort by name
        features.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return features;
    }
}
