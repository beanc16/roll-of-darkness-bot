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
import { HeldItemType, PtuHeldItem } from '../../types/PtuHeldItem.js';

export interface GetLookupHeldItemDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    type?: HeldItemType | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupHeldItemStrategy
{
    public static key: PtuLookupSubcommand.HeldItem = PtuLookupSubcommand.HeldItem;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.HeldItem);
        const type = interaction.options.getString('type') as HeldItemType | null;

        const heldItems = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: heldItems,
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
            noEmbedsErrorMessage: 'No held items were found.',
        });
    }

    private static async getLookupData(input: GetLookupHeldItemDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuHeldItem[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.HeldItem,
        });

        const heldItems = data.reduce<PtuHeldItem[]>((acc, cur) =>
        {
            const heldItem = new PtuHeldItem(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== heldItem.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            // TODO: Allow badges later, this is temporary
            if (input.type && input.type !== heldItem.type && heldItem.type !== HeldItemType.Badge)
            {
                return acc;
            }

            // TODO: Allow badges later, this is temporary
            if (!heldItem.name.includes('Badge'))
            {
                acc.push(heldItem);
            }
            return acc;
        }, []);

        // Sort by name
        heldItems.sort((a, b) => a.name.localeCompare(b.name));

        return heldItems;
    }
}
