import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { getLookupMeritsEmbedMessages } from '../../embed-messages/lookup.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { NwodMerit } from '../../types/NwodMerit.js';
import { MeritType, NwodCompleteParameterName } from '../../types/types.js';

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
        const name = interaction.options.getString(NwodCompleteParameterName.MeritName);
        const type1 = interaction.options.getString('type_1') as MeritType | null;
        const type2 = interaction.options.getString('type_2') as MeritType | null;
        const type3 = interaction.options.getString('type_3') as MeritType | null;

        const keywords = await this.getLookupData({
            name,
            types: [type1, type2, type3],
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupMeritsEmbedMessages(keywords);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No merits were found.',
        });
    }

    private static async getLookupData(input: GetLookupMeritDataOptions = {
        includeAllIfNoName: true,
    }): Promise<NwodMerit[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: `'Merits'!A2:Z`,
        });

        const types = input.types?.reduce<MeritType[]>((acc, type) =>
        {
            if (type)
            {
                acc.push(type);
            }

            return acc;
        }, []) ?? [] as MeritType[];

        const merits = data.reduce<NwodMerit[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const merit = new NwodMerit(cur);

            if (merit.name === undefined || merit.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== merit.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (types.length > 0 && !types.every(type => type && merit.types.includes(type)))
            {
                return acc;
            }

            acc.push(merit);
            return acc;
        }, []);

        // Sort by name
        merits.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return merits;
    }
}
