import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';
import { NwodTilt } from '../../types/NwodTilt.js';
import { NwodTiltType } from '../../types/types.js';

export interface GetLookupTiltDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    type?: NwodTiltType | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupTiltStrategy
{
    public static key = NwodLookupSubcommand.Tilt;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.TiltName);
        const type = interaction.options.getString('type') as NwodTiltType | null;

        const data = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Tilts',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.types !== undefined
                    ? [[
                        element.types.length > 1 ? 'Types' : 'Type',
                        element.types.join(', '),
                    ].join(': ')]
                    : []
                ),
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
                ...(element.causingTheTilt !== undefined
                    ? [
                        `Causing the Tilt:\n\`\`\`\n${element.causingTheTilt}\`\`\``,
                    ]
                    : []
                ),
                ...(element.endingTheTilt !== undefined
                    ? [
                        `Ending the Tilt:\n\`\`\`\n${element.endingTheTilt}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Tilt}`,
            noEmbedsErrorMessage: 'No tilts were found.',
        });
    }

    private static async getLookupData(input: GetLookupTiltDataOptions = {
        includeAllIfNoName: true,
    }): Promise<NwodTilt[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Tilt,
        });

        const output = data.reduce<NwodTilt[]>((acc, cur) =>
        {
            const element = new NwodTilt(cur);

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && !element.types.some(type => type.toLowerCase() === input.type?.toLowerCase()))
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
