import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { getLookupStatusesEmbedMessages } from '../../../Ptu/embed-messages/lookup.js';
import { BaseLookupRespondStrategy } from './BaseLookupRespondStrategy.js';
import { PtuStatus } from '../../models/PtuStatus.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';

export interface GetLookupStatusDataParameters
{
    name?: string | null;
    type?: string | null;
    includeAllIfNoName?: boolean;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupStatusStrategy
{
    public static key = PtuLookupSubcommand.Status;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('status_name');
        const type = interaction.options.getString('status_type');

        const statuses = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupStatusesEmbedMessages(statuses);

        return await BaseLookupRespondStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No statuses were found.',
        });
    }

    private static async getLookupData(input: GetLookupStatusDataParameters = {
        includeAllIfNoName: true,
    })
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Status Data'!A2:Z`,
        });

        const statuses = data.reduce<PtuStatus[]>((acc, cur) =>
        {
            const status = new PtuStatus(cur);

            // Name
            if (input.name && input.name !== status.name && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && input.type !== status.type)
            {
                return acc;
            }

            acc.push(status);
            return acc;
        }, []);

        // Sort by name
        statuses.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return statuses;
    }
}
