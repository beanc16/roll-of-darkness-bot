import { APIApplicationCommandOptionChoice, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getSpreadsheetIdFromSheetName } from '../../constants.js';
import { PtuAdminAddSubcommand } from '../../options/admin.js';
import {
    PtuCharacterSheetName,
    ptuCharacterSheetNameChoices,
    PtuSheetName,
    ptuSheetNameChoices,
} from '../../types/sheets.js';

@staticImplements<ChatIteractionStrategy>()
export class AddAbilityStrategy
{
    public static key: PtuAdminAddSubcommand.Ability = PtuAdminAddSubcommand.Ability;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const sheetName = interaction.options.getString('sheet_name', true) as PtuCharacterSheetName | PtuSheetName;
        const name = interaction.options.getString('name', true);
        const frequency = interaction.options.getString('frequency', true);
        const effect = interaction.options.getString('effect', true);
        const trigger = interaction.options.getString('trigger') ?? '';
        const target = interaction.options.getString('target') ?? '';
        const keywords = interaction.options.getString('keywords') ?? '';

        // Get spreadsheet info based on
        const { spreadsheetIds, discordUserIdsOfSpreadsheetEditors } = getSpreadsheetIdFromSheetName(sheetName);

        // Someone is trying to mess with a sheet they don't own
        if (!discordUserIdsOfSpreadsheetEditors.includes(interaction.user.id))
        {
            const sheetsText = (spreadsheetIds.length > 1)
                ? 'these sheets'
                : 'this sheet';
            await interaction.editReply(
                `The owner of this bot has not given you permission to run this command on ${sheetsText}. `
                + `If you feel that you should have this permission, please contact this bot's owner.`,
            );
            return true;
        }

        // TODO: Create batch append later instead of Promise.all-ing
        const appendPromises = spreadsheetIds.map(async (spreadsheetId) =>
        {
            await CachedGoogleSheetsApiService.append({
                spreadsheetId,
                range: `'Abilities Data'!A2:Z`,
                values: [
                    [name, frequency, effect, trigger, target, keywords],
                ],
            });
        });
        await Promise.all(appendPromises);

        // Send message
        const sheetsText = (spreadsheetIds.length > 1)
            ? 'sheets'
            : 'sheet';
        await interaction.editReply(`Added the "${name}" ability to the "${sheetName}" ${sheetsText}.`);

        return true;
    }

    public static getLookupData(): APIApplicationCommandOptionChoice<string>[]
    {
        const output = [
            ...ptuSheetNameChoices,
            ...ptuCharacterSheetNameChoices,
        ];

        // Sort by name
        output.sort((a, b) => a.name.localeCompare(b.name));

        return output;
    }
}
