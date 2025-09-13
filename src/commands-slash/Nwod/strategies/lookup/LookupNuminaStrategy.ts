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
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';
import { NwodNumina } from '../../types/NwodNumina.js';

export interface GetLookupNuminaDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    type?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupNuminaStrategy
{
    public static key = NwodLookupSubcommand.Numina;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.NuminaName);
        const type = interaction.options.getString(NwodAutocompleteParameterName.NuminaType);

        const data = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Numina',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.cost !== undefined
                    ? [`Cost: ${element.cost}`]
                    : []
                ),
                ...(element.roll !== undefined
                    ? [`Roll: ${element.roll}`]
                    : []
                ),
                ...(element.types !== undefined
                    ? [[
                        element.types.length > 1 ? 'Types' : 'Type',
                        element.types.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.isReaching !== undefined
                    ? [`Is Reaching: ${element.isReaching ? 'Yes' : 'No'}`]
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
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Numina}`,
            noEmbedsErrorMessage: 'No numina were found.',
        });
    }

    private static async getLookupData(input: GetLookupNuminaDataOptions = {
        includeAllIfNoName: true,
    }): Promise<NwodNumina[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Numina,
        });

        const output = data.reduce<NwodNumina[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new NwodNumina(cur);

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
            if (input.type && !element.types?.includes(input.type))
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
