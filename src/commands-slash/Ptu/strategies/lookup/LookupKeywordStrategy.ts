import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getLookupKeywordsEmbedMessages } from '../../embed-messages/lookup.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { PtuKeyword } from '../../types/PtuKeyword.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';

export interface GetLookupKeywordDataParameters
{
    name?: string | null;
    includeAllIfNoName?: boolean;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupKeywordStrategy
{
    public static key = PtuLookupSubcommand.Keyword;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('keyword_name');

        const keywords = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupKeywordsEmbedMessages(keywords);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No keywords were found.',
        });
    }

    private static async getLookupData(input: GetLookupKeywordDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuKeyword[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Keyword Data'!A2:Z`,
        });

        const keywords = data.reduce<PtuKeyword[]>((acc, cur) =>
        {
            const keyword = new PtuKeyword(cur);

            // TODO: Remove this once all keywords are defined
            if (keyword.name === undefined || keyword.name.trim() === '')
            {
                return acc;
            }

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name.toLowerCase() === keyword.name.toLowerCase()) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(keyword);
            return acc;
        }, []);

        // Sort by name
        keywords.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return keywords;
    }
}
