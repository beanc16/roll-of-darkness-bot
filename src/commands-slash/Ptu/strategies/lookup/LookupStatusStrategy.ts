import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getLookupStatusesEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuStatus } from '../../types/PtuStatus.js';

export interface GetLookupStatusDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    type?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupStatusStrategy
{
    public static key: PtuLookupSubcommand.Status = PtuLookupSubcommand.Status;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
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

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No statuses were found.',
        });
    }

    private static async getLookupData(input: GetLookupStatusDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuStatus[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Status Data'!A2:Z`,
        });

        const statuses = data.reduce<PtuStatus[]>((acc, cur) =>
        {
            const status = new PtuStatus(cur);

            // Name
            if (input.name && input.name.toLowerCase() !== status.name.toLowerCase() && !input.includeAllIfNoName)
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
        statuses.sort((a, b) => a.name.localeCompare(b.name));

        return statuses;
    }
}
