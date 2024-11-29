import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { getLookupConditionsEmbedMessages } from '../../embed-messages/lookup.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { NwodLookupRange } from '../../types/lookup.js';
import { NwodCondition } from '../../types/NwodCondition.js';
import { NwodAutocompleteParameterName } from '../../types/types.js';

export interface GetLookupMeritDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupConditionStrategy
{
    public static key = NwodLookupSubcommand.Condition;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.ConditionName);

        const conditions = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupConditionsEmbedMessages(conditions);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No conditions were found.',
        });
    }

    private static async getLookupData(input: GetLookupMeritDataOptions = {
        includeAllIfNoName: true,
    }): Promise<NwodCondition[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Condition,
        });

        const conditions = data.reduce<NwodCondition[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const condition = new NwodCondition(cur);

            if (condition.name === undefined || condition.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== condition.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(condition);
            return acc;
        }, []);

        // Sort by name
        conditions.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return conditions;
    }
}
