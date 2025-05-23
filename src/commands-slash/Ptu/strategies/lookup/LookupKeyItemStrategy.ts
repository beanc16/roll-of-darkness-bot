import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuKeyItem, PtuKeyItemType } from '../../types/PtuKeyItem.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupKeyItemDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    type?: PtuKeyItemType | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupKeyItemStrategy
{
    public static key: PtuLookupSubcommand.KeyItem = PtuLookupSubcommand.KeyItem;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.KeyItemName);
        const type = interaction.options.getString('type') as PtuKeyItemType | null;

        const data = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Key Items',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.cost !== undefined ? [`Cost: ${element.cost}`] : []),
                ...(element.type !== undefined ? [`Type: ${element.type}`] : []),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.KeyItem}`,
            noEmbedsErrorMessage: 'No key items were found.',
        });
    }

    public static async getLookupData(input: GetLookupKeyItemDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuKeyItem[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.KeyItem,
        });

        const output = data.reduce<PtuKeyItem[]>((acc, cur) =>
        {
            const element = new PtuKeyItem(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && input.type !== element.type)
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
