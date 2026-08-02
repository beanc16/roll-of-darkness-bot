import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuTag } from '../../types/PtuTag.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupTagDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupTagStrategy
{
    public static key: PtuLookupSubcommand.Tag = PtuLookupSubcommand.Tag;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.TagName, true);

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Tags',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.description !== undefined
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Tag}`,
            noEmbedsErrorMessage: 'No tags were found.',
        });
    }

    public static async getLookupData(input: GetLookupTagDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuTag[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Tag,
        });

        const output = data.reduce<PtuTag[]>((acc, cur) =>
        {
            const element = new PtuTag(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
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
