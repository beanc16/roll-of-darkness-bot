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
import { NwodMerit } from '../../types/NwodMerit.js';
import { MeritType } from '../../types/types.js';

export interface GetLookupMeritDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    types?: [
        (MeritType | null)?,
        (MeritType | null)?,
        (MeritType | null)?,
    ];
}

@staticImplements<ChatIteractionStrategy>()
export class LookupMeritStrategy
{
    public static key = NwodLookupSubcommand.Merit;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.MeritName);
        const type1 = interaction.options.getString('type_1') as MeritType | null;
        const type2 = interaction.options.getString('type_2') as MeritType | null;
        const type3 = interaction.options.getString('type_3') as MeritType | null;

        const data = await this.getLookupData({
            name,
            types: [type1, type2, type3],
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Merits',
            parseElementToLines: element => [
                `${Text.bold(element.name)} (${element.dots})`,
                ...(element.types !== undefined
                    ? [[
                        element.types.length > 1 ? 'Types' : 'Type',
                        element.types.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.prerequisites !== undefined
                    ? [`Prerequisites: ${element.prerequisites}`]
                    : []
                ),
                ...(element.activationRoll !== undefined
                    ? [`Activation Roll: ${element.activationRoll}`]
                    : []
                ),
                ...(element.action !== undefined
                    ? [`Action: ${element.action}`]
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
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Merit}`,
            noEmbedsErrorMessage: 'No merits were found.',
        });
    }

    private static async getLookupData(input: GetLookupMeritDataOptions = {
        includeAllIfNoName: true,
    }): Promise<NwodMerit[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Merit,
        });

        const types = input.types?.reduce<MeritType[]>((acc, type) =>
        {
            if (type)
            {
                acc.push(type);
            }

            return acc;
        }, []) ?? [] as MeritType[];

        const output = data.reduce<NwodMerit[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new NwodMerit(cur);

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
            if (types.length > 0 && !types.every(type => type && element.types.includes(type)))
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
