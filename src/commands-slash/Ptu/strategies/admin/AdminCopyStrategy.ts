import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import {
    CachedGoogleSheetsApiService,
    CachedGoogleSheetsUpdateResponse,
    GoogleSheetsApiErrorType,
} from '../../../../services/CachedGoogleSheetsApiService.js';
import { getSpreadsheetInfo, SpreadsheetData } from '../../services/sheetHelpers.js';
import { PtuCharacterSheetName, PtuDataSheetName, PtuSheetName } from '../../types/sheets.js';
import { PtuAdminSubcommand } from '../../subcommand-groups/admin.js';
import { Text } from '@beanc16/discordjs-helpers';

type AddToSpreadsheetsResponse = SpreadsheetData & CachedGoogleSheetsUpdateResponse;
type InteractionMethod = 'editReply' | 'followUp';

interface SendReplyForGoogleSheetsErrorTypeParameters
{
    interaction: ChatInputCommandInteraction;
    interactionMethod: InteractionMethod;
    sheetName: PtuSheetName | PtuCharacterSheetName;
    errorType: GoogleSheetsApiErrorType;
    dataToLog: object;
}

const howToShareSpreadsheetsHelpArticle = 'https://support.google.com/docs/answer/9331169?hl=en#6.1';

@staticImplements<ChatIteractionStrategy>()
export class AdminCopyStrategy
{
    static key = PtuAdminSubcommand.Copy;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const dataSheet = interaction.options.getString('data_sheet', true) as PtuDataSheetName;
        const fromSheet = interaction.options.getString('from', true) as PtuSheetName | PtuCharacterSheetName;
        const toSheet = interaction.options.getString('to', true) as PtuSheetName | PtuCharacterSheetName;
        const nameToSearch = interaction.options.getString('name', true);

        // Parse spreadsheet info
        const fromSpreadsheetInfo = getSpreadsheetInfo(fromSheet);
        const toSpreadsheetInfo = getSpreadsheetInfo(toSheet);

        // Data not found
        if (!fromSpreadsheetInfo || !toSpreadsheetInfo)
        {
            await interaction.editReply(
                `Failed to find the given sheets. Please contact this bot's owner.`
            );
            return true;
        }

        // Someone is trying to copy from a sheet they don't own
        if (!fromSpreadsheetInfo.discordUserIdsOfSpreadsheetEditors.includes(interaction.user.id))
        {
            await interaction.editReply(
                `The owner of this bot has not given you permission to copy data from these character sheets. `
                + `If you feel that you should have permission to do so, please contact this bot's owner.`
            );
            return true;
        }

        // Someone is trying to copy to a sheet they don't own
        if (!toSpreadsheetInfo.discordUserIdsOfSpreadsheetEditors.includes(interaction.user.id))
        {
            await interaction.editReply(
                `The owner of this bot has not given you permission to copy data to these character sheets. `
                + `If you feel that you should have permission to do so, please contact this bot's owner.`
            );
            return true;
        }

        // TODO: Get ranges from toSpreadsheetInfo to check for duplicates

        // Get data from the spreadsheet
        const spreadsheetValuesResult = await this.getSpreadsheetValues({
            spreadsheetId: fromSpreadsheetInfo.spreadsheetIds[0],
            dataSheetName: dataSheet,
            nameToSearch,
        });

        // Add safety rail for missing data
        if (!spreadsheetValuesResult)
        {
            await interaction.editReply(
                `Failed to retrieve data from ${fromSheet}. Please contact this bot's owner for help fixing the issue.`
            );
            logger.warn(`Failed to retrieve data from the "fromSheet" for ${this.name}`, {
                dataSheet,
                fromSheet,
                toSheet,
                nameToSearch,
                fromSpreadsheetInfo,
                toSpreadsheetInfo,
            });
            return true;
        }

        if (typeof spreadsheetValuesResult === 'string')
        {
            const errorType = spreadsheetValuesResult as GoogleSheetsApiErrorType;

            this.sendReplyForGoogleSheetsErrorType({
                interaction,
                interactionMethod: 'editReply',
                sheetName: fromSheet,
                errorType,
                dataToLog: {
                    errorType,
                    dataSheet,
                    fromSheet,
                    toSheet,
                    nameToSearch,
                    fromSpreadsheetInfo,
                    toSpreadsheetInfo,
                },
            });
            return true;
        }

        const addToSpreadsheetsResponse = await this.addToSpreadsheets({
            spreadsheetData: toSpreadsheetInfo.spreadsheetData!,
            dataSheetName: dataSheet,
            dataRow: spreadsheetValuesResult,
        });

        const successfulSpreadsheetNames = await this.handleAddToSpreadsheetsResponse(addToSpreadsheetsResponse, {
            interaction,
            dataToLog: {
                dataSheet,
                fromSheet,
                toSheet,
                nameToSearch,
                fromSpreadsheetInfo,
                toSpreadsheetInfo,
            },
        });

        const combinedSuccessfulSpreadsheetNames = successfulSpreadsheetNames.join(', ');

        await interaction.editReply(
            `Successfully copied ${Text.Code.oneLine(nameToSearch)} `
            + `on the ${Text.Code.oneLine(dataSheet)} page `
            + `from ${Text.Code.oneLine(fromSheet)} `
            + `to ${Text.Code.oneLine(combinedSuccessfulSpreadsheetNames)}`
        );

        return true;
    }

    private static async sendReplyForGoogleSheetsErrorType({
        interaction,
        interactionMethod,
        sheetName,
        errorType,
        dataToLog,
    }: SendReplyForGoogleSheetsErrorTypeParameters)
    {
        if (errorType === GoogleSheetsApiErrorType.UserNotAddedToSheet)
        {
            await this.sendPermissionError({
                interaction,
                interactionMethod,
                action: 'view',
                sheetName,
            });
        }
        else if (errorType === GoogleSheetsApiErrorType.UnableToParseRange)
        {
            await this.sendReplyByType({
                interaction,
                interactionMethod,
                options: `I'm unable to parse data on the page named "${sheetName}". `
                    + `Please contact this bot's owner for help fixing the issue.`,
            });
        }
        else
        {
            await this.sendReplyByType({
                interaction,
                interactionMethod,
                options: `An unknown error occurred whilst trying to pull data from "${sheetName}". `
                    +  `Please contact this bot's owner for help fixing the issue.`
            });
            logger.error(`An unknown error occurred whilst trying to pull data in ${this.name}.`, dataToLog);
        }
    }

    private static async sendPermissionError({
        interaction,
        interactionMethod = 'editReply',
        action,
        sheetName,
    }: {
        interaction: ChatInputCommandInteraction;
        interactionMethod: InteractionMethod;
        action: 'view' | 'edit';
        sheetName: PtuSheetName | PtuCharacterSheetName;
    })
    {
        await this.sendReplyByType({
            interaction,
            interactionMethod,
            options: `I don't have permission to ${action} ${sheetName}. `
                + `You will be DM'd instructions for how to give me edit permissions here shortly.`
        });
        await interaction.user.send(
            `If you want to use \`/ptu_admin copy\`, then I need edit access to ${sheetName}. ` +
            `If you aren't sure how to give me edit permissions, please follow this guide:\n${howToShareSpreadsheetsHelpArticle}.\n\n` +
            `You can either make your sheet editable by anyone with the URL or add this email as an editor (whichever you prefer):\n\`${process.env.GOOGLE_SHEETS_MICROSERVICE_EMAIL_ADDRESS}\``
        );
    }

    private static async sendReplyByType({
        interaction,
        interactionMethod,
        options,
    }: {
        interaction: ChatInputCommandInteraction;
        interactionMethod: InteractionMethod;
        options: string;
    })
    {
        const handlerMap: Record<InteractionMethod, Function> = {
            editReply: (options: string) => interaction.editReply(options),
            followUp: (options: string) => interaction.followUp(options),
        };

        await handlerMap[interactionMethod](options);
    }

    private static async getSpreadsheetValues({
        spreadsheetId,
        dataSheetName,
        nameToSearch,
    }: {
        spreadsheetId: string;
        dataSheetName: PtuDataSheetName;
        nameToSearch: string;
    }): Promise<string[] | GoogleSheetsApiErrorType | undefined>
    {
        // Get data from the spreadsheet
        const {
            data = [],
            errorType,
        } = await CachedGoogleSheetsApiService.getRange({
            range: `'${dataSheetName}'!A:AZ`,
            spreadsheetId,
            shouldNotCache: true,
        }) ?? [];

        if (errorType)
        {
            return errorType;
        }

        return data.find(([nameFromSheet = '']) => {
            return nameToSearch.toLowerCase() === nameFromSheet.toLowerCase();
        });
    }

    private static async addToSpreadsheets({
        spreadsheetData = [],
        dataSheetName,
        dataRow,
    }: {
        spreadsheetData: SpreadsheetData[];
        dataSheetName: PtuDataSheetName;
        dataRow: string[];
    })
    {
        const handlerMap: Record<PtuDataSheetName, () => Promise<AddToSpreadsheetsResponse[]>> = {
            [PtuDataSheetName.PokemonData]: async () =>
            {
                const promises = spreadsheetData.map(async ({ id, name }) =>
                {
                    try
                    {
                        const { errorType } = await CachedGoogleSheetsApiService.append({
                            range: `'${dataSheetName}'!A:AZ`,
                            spreadsheetId: id,
                            values: [dataRow],
                            shouldNotCache: true,
                        });

                        return {
                            id,
                            name,
                            errorType,
                        };
                    }

                    catch (error)
                    {
                        logger.error(`Failed to append data in ${this.name}.addToSpreadsheets.`, {
                            spreadsheetId: id,
                            sheetName: name,
                            dataSheetName,
                            dataRow,
                        });
                    }

                    return undefined;
                });

                const responses = (
                    await Promise.all(promises)
                ).filter((response) => !!response);

                return responses;
            },
        };

        return await handlerMap[dataSheetName]();
    }

    private static async handleAddToSpreadsheetsResponse(
        addToSpreadsheetsResponse: AddToSpreadsheetsResponse[],
        errorParameters: Omit<
            SendReplyForGoogleSheetsErrorTypeParameters,
            'interactionMethod' | 'sheetName' | 'errorType'
        >,
    )
    {
        const successfulSpreadsheetNames: (PtuSheetName | PtuCharacterSheetName)[] = [];

        for (const response of addToSpreadsheetsResponse)
        {
            const {
                id,
                name,
                errorType,
            } = response;

            if (errorType)
            {
                await this.sendReplyForGoogleSheetsErrorType({
                    ...errorParameters,
                    interactionMethod: 'followUp',
                    sheetName: name,
                    errorType,
                    dataToLog: {
                        ...errorParameters.dataToLog,
                        errorType,
                        spreadsheetId: id,
                        spreadsheetName: name,
                    },
                });
            }

            else
            {
                successfulSpreadsheetNames.push(name);
            }
        }

        return successfulSpreadsheetNames;
    }
}
