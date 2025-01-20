import { APIApplicationCommandOptionChoice, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { GoogleSheetsApiErrorType } from '../../../../services/CachedGoogleSheetsApiService/types.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getSpreadsheetIdFromSheetName } from '../../constants.js';
import { PtuAdminAddSubcommand } from '../../options/admin.js';
import {
    PtuCharacterSheetName,
    ptuCharacterSheetNameChoices,
    PtuSheetName,
    ptuSheetNameChoices,
} from '../../types/sheets.js';
import { CharacterSheetStrategy } from '../CharacterSheetStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class AddAbilityStrategy extends CharacterSheetStrategy
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
        const spreadsheetIdsWithUserNotAddedToSheetErrors: string[] = [];
        const spreadsheetIdsWithUnknownErrors: string[] = [];
        const appendPromises = spreadsheetIds.map(async (spreadsheetId) =>
        {
            const { errorType } = await CachedGoogleSheetsApiService.append({
                spreadsheetId,
                range: `'Abilities Data'!A2:Z`,
                values: [
                    [name, frequency, effect, trigger, target, keywords],
                ],
            });

            if (errorType === GoogleSheetsApiErrorType.UserNotAddedToSheet)
            {
                spreadsheetIdsWithUserNotAddedToSheetErrors.push(spreadsheetId);
            }

            if (errorType === GoogleSheetsApiErrorType.UnknownError)
            {
                spreadsheetIdsWithUnknownErrors.push(spreadsheetId);
            }
        });
        await Promise.all(appendPromises);

        // Send messages
        if (spreadsheetIds.length > spreadsheetIdsWithUserNotAddedToSheetErrors.length + spreadsheetIdsWithUnknownErrors.length)
        {
            const sheetsText = (spreadsheetIds.length > 1)
                ? 'sheets'
                : 'sheet';
            await interaction.editReply(`Added the "${name}" ability to the "${sheetName}" ${sheetsText}.`);
        }

        await Promise.all([
            ...(spreadsheetIdsWithUserNotAddedToSheetErrors.length > 0
                ? [
                    await this.sendPermissionErrors({
                        interaction,
                        commandName: `/ptu_admin ${PtuAdminAddSubcommand.Ability}`,
                        errorData: spreadsheetIdsWithUserNotAddedToSheetErrors.map((spreadsheetId) =>
                        {
                            return {
                                action: 'edit',
                                spreadsheetId,
                            };
                        }),
                    }),
                ]
                : []
            ),
            ...(spreadsheetIdsWithUnknownErrors.length > 0
                ? [
                    await interaction.editReply(
                        `An unknown error occurred whilst trying to add an ability to the following sheets:`
                        + `\n\`\`\`\n- ${spreadsheetIdsWithUnknownErrors.join('\n- ')}\n\`\`\`\n\n `
                        + `Please contact this bot's owner for help fixing the issue.`,
                    ),
                ]
                : []
            ),
        ]);

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
