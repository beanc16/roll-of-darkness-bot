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
import { PtuEquipment, PtuEquipmentSlot } from '../../types/PtuEquipment.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupEquipmentDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    slot?: PtuEquipmentSlot | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupEquipmentStrategy
{
    public static key: PtuLookupSubcommand.Equipment = PtuLookupSubcommand.Equipment;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.EquipmentName);
        const slot = interaction.options.getString('slot') as PtuEquipmentSlot | null;

        const data = await this.getLookupData({
            name,
            slot,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Equipment',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.slots !== undefined && element.slots.length > 0
                    ? [`Slots: ${element.slots.join(', ')}`]
                    : []
                ),
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
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Equipment}`,
            noEmbedsErrorMessage: 'No equipment was found.',
        });
    }

    public static async getLookupData(input: GetLookupEquipmentDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuEquipment[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Equipment,
        });

        const output = data.reduce<PtuEquipment[]>((acc, cur) =>
        {
            const element = new PtuEquipment(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Slots
            if (input.slot && !element.slots.some(slot => slot.toLowerCase() === input.slot?.toLowerCase()))
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
