import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { ChangelingNeedle } from '../../types/ChangelingNeedle.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';

export interface GetLookupNeedleDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupNeedleStrategy
{
    public static key = NwodLookupSubcommand.Needle;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.NeedleName);

        const needles = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: needles,
            title: 'Needles',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.pageNumber !== undefined
                    ? [`Page Number: ${element.pageNumber}`]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No needles were found.',
        });
    }

    private static async getLookupData(input: GetLookupNeedleDataOptions = {
        includeAllIfNoName: true,
    }): Promise<ChangelingNeedle[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Needle,
        });

        const needles = data.reduce<ChangelingNeedle[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const needle = new ChangelingNeedle(cur);

            if (needle.name === undefined || needle.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== needle.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(needle);
            return acc;
        }, []);

        // Sort by name
        needles.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return needles;
    }
}
