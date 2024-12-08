import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
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

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'TMs',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.cost !== undefined ? [`Cost: ${element.cost}`] : []),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

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

        const output = data.reduce<PtuTm[]>((acc, cur) =>
        {
            const element = new PtuTm(cur);

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name === element.name) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) => a.name.localeCompare(b.name));

        return output;
    }
}
