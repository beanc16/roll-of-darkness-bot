import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { getLookupThreadsEmbedMessages } from '../../embed-messages/lookup.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { ChangelingThread } from '../../types/ChangelingThread.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';

export interface GetLookupThreadDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupThreadStrategy
{
    public static key = NwodLookupSubcommand.Thread;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.ThreadName);

        const threads = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupThreadsEmbedMessages(threads);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No threads were found.',
        });
    }

    private static async getLookupData(input: GetLookupThreadDataOptions = {
        includeAllIfNoName: true,
    }): Promise<ChangelingThread[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Thread,
        });

        const threads = data.reduce<ChangelingThread[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const thread = new ChangelingThread(cur);

            if (thread.name === undefined || thread.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== thread.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(thread);
            return acc;
        }, []);

        // Sort by name
        threads.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return threads;
    }
}
