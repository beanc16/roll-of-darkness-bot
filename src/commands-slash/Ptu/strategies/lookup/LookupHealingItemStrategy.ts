import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { HealingItemType, PtuHealingItem } from '../../types/PtuHealingItem.js';

export interface GetLookupHealingItemDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    type?: HealingItemType | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupHealingItemStrategy
{
    public static key: PtuLookupSubcommand.HealingItem = PtuLookupSubcommand.HealingItem;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.HealingItem);
        const type = interaction.options.getString('type') as HealingItemType | null;

        const data = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Held Items',
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
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.HealingItem}`,
            noEmbedsErrorMessage: 'No healing items were found.',
        });
    }

    private static async getLookupData(input: GetLookupHealingItemDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuHealingItem[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.HealingItem,
        });

        const output = data.reduce<PtuHealingItem[]>((acc, cur) =>
        {
            const element = new PtuHealingItem(cur);

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
