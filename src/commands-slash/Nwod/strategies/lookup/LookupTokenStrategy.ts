import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { ChangelingToken } from '../../types/ChangelingToken.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';
import { ChangelingTokenType } from '../../types/types.js';

export interface GetLookupTokenDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    type?: ChangelingTokenType | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupTokenStrategy
{
    public static key = NwodLookupSubcommand.Token;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.TokenName);
        const type = interaction.options.getString('type') as ChangelingTokenType | null;

        const data = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Tokens',
            parseElementToLines: element => [
                `${Text.bold(element.name)} (${element.dots})`,
                ...(element.type !== undefined
                    ? [`Type: ${element.type}`]
                    : []
                ),
                ...(element.catch !== undefined
                    ? [`Catch: ${element.catch}`]
                    : []
                ),
                ...(element.drawback !== undefined
                    ? [`Drawback: ${element.drawback}`]
                    : []
                ),
                ...(element.pageNumber !== undefined
                    ? [`Page Number: ${element.pageNumber}`]
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
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Token}`,
            noEmbedsErrorMessage: 'No tokens were found.',
        });
    }

    private static async getLookupData(input: GetLookupTokenDataOptions = {
        includeAllIfNoName: true,
    }): Promise<ChangelingToken[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Token,
        });

        const output = data.reduce<ChangelingToken[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new ChangelingToken(cur);

            if (element.name === undefined || element.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && input.type.toLowerCase() !== element.type.toLowerCase())
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return output;
    }
}
