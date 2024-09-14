import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../../options/subcommand-groups/ptu/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { getLookupTmsEmbedMessages } from '../../../embed-messages/ptu/lookup.js';
import { BaseLookupRespondStrategy } from './BaseLookupRespondStrategy.js';
import { PtuTm } from '../../../../models/PtuTm.js';

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
        const name = interaction.options.getString('tm_name');

        const tms = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // TODO: Add listview and final paginated functionality later

        // Get message
        const embeds = getLookupTmsEmbedMessages(tms);

        return await BaseLookupRespondStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No tms were found.',
        });
    }

    private static async getLookupData(input: GetLookupTmDataParameters = {
        includeAllIfNoName: true,
    })
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI', // TODO: Make this a constant at some point
            range: `'Tm Data'!A2:Z`,
        });

        const tms = data.reduce<PtuTm[]>((acc, cur) =>
        {
            // cur[0] === name in spreadsheet
            if (!(input.name && input.name === cur[0]) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(
                new PtuTm(cur)
            );
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
