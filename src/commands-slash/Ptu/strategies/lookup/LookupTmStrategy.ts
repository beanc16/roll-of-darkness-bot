import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { getLookupTmsEmbedMessages } from '../../../Ptu/embed-messages/lookup.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { PtuTm } from '../../models/PtuTm.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';

export interface GetLookupTmDataParameters
{
    name?: string | null;
    includeAllIfNoName?: boolean;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupTmStrategy
{
    public static key = PtuLookupSubcommand.Tm;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('tm_name', true);

        const tms = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupTmsEmbedMessages(tms);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No tms were found.',
        });
    }

    private static async getLookupData(input: GetLookupTmDataParameters = {
        includeAllIfNoName: true,
    })
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Tm Data'!A2:Z`,
        });

        const tms = data.reduce<PtuTm[]>((acc, cur) =>
        {
            const tm = new PtuTm(cur);

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name === tm.name) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(tm);
            return acc;
        }, []);

        // Sort by name
        tms.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return tms;
    }
}
