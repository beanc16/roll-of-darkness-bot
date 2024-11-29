import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getLookupTmsEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuTm } from '../../types/PtuTm.js';

export interface GetLookupTmDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupTmStrategy
{
    public static key: PtuLookupSubcommand.Tm = PtuLookupSubcommand.Tm;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.TmName, true);

        const tms = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupTmsEmbedMessages(tms);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No tms were found.',
        });
    }

    private static async getLookupData(input: GetLookupTmDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuTm[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Tm,
        });

        const tms = data.reduce<PtuTm[]>((acc, cur) =>
        {
            const tm = new PtuTm(cur);

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name === tm.name) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(tm);
            return acc;
        }, []);

        // Sort by name
        tms.sort((a, b) => a.name.localeCompare(b.name));

        return tms;
    }
}
