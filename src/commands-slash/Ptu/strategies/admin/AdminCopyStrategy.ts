import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import {
    CachedGoogleSheetsApiService,
    CachedGoogleSheetsUpdateResponse,
    GoogleSheetsApiErrorType,
} from '../../../../services/CachedGoogleSheetsApiService.js';
import { getSpreadsheetInfo, GetSpreadsheetInfoResponse, SpreadsheetData } from '../../services/sheetHelpers.js';
import { PtuCharacterSheetName, PtuDataSheetName, PtuSheetName } from '../../types/sheets.js';
import { PtuAdminSubcommand } from '../../subcommand-groups/admin.js';
import { Text } from '@beanc16/discordjs-helpers';
import { GoogleSheetsGetRangeParametersV1 } from '@beanc16/microservices-abstraction';

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

interface HandleAddToSpreadsheetsResponseResponse
{
    successfulSpreadsheetNames: (PtuSheetName | PtuCharacterSheetName)[];
    partiallyFailedDataSheetNames: (PtuDataSheetName | 'Pokemon Skills')[];
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

        // Get data from the spreadsheet
        const spreadsheetValuesResult = await this.getSpreadsheetValues({
            spreadsheetIds: [
                fromSpreadsheetInfo.spreadsheetIds[0],
                ...toSpreadsheetInfo.spreadsheetIds,
            ],
            dataSheetName: dataSheet,
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

        // TODO: Use toData to only include toSpreadsheetInfo that don't have duplicates
        const {
            fromData,
            toData,
        } = this.parseGetData({
            data: spreadsheetValuesResult,
            dataSheet,
            nameToSearch,
            toSpreadsheetInfo,
        });

        if (!fromData || ('pokemonData' in fromData && !fromData.pokemonData))
        {
            await interaction.editReply(
                `${nameToSearch} was not found in ${fromSheet}. `
                + `Please ensure that it's in the sheet and it's being spelled `
                + `correctly in the command input before trying to copy it again.`
            );
            return true;
        }

        for (const curToData of toData)
        {
            if (
                'isInPokemonData' in curToData
                && (curToData.isInPokemonData || curToData.isInPokemonSkills)
            )
            {
                const sheets = [
                    ...(curToData.isInPokemonData
                        ? [Text.Code.oneLine(PtuDataSheetName.PokemonData)]
                        : []),
                    ...(curToData.isInPokemonSkills
                        ? [Text.Code.oneLine('Pokemon Skills')]
                        : []),
                ];
                const pageOrPages = `page${sheets.length > 1 ? 's' : ''}`;

                await interaction.followUp(
                    `${nameToSearch} was found on the ${sheets.join(' & ')} `
                    + `${pageOrPages} from ${curToData.spreadsheetData.name}, `
                    + `so it won't be added to ${sheets.length > 1 ? 'those' : 'that'} `
                    + `${pageOrPages}`
                );
                continue;
            }

            // TODO: Handle else if standard case later.

            /*
             * TODO:
             * Set a variable instead of toSpreadsheetInfo.spreadsheetData!
             * Make it also control if data is added to both "Pokemon Data"
             * and "Pokemon Skills", just one, or neither.
             */
        }

        const addToSpreadsheetsResponse = ('pokemonData' in fromData && 'pokemonData' in toData)
            ? await this.addToSpreadsheets({
                spreadsheetData: toSpreadsheetInfo.spreadsheetData!,
                dataSheetName: dataSheet,
                dataRow: fromData.pokemonData as string[],
                dataRow2: fromData.pokemonSkills as string[],
            })
            : await this.addToSpreadsheets({
                spreadsheetData: toSpreadsheetInfo.spreadsheetData!,
                dataSheetName: dataSheet,
                dataRow: fromData as string[],
            });

        const {
            successfulSpreadsheetNames,
            partiallyFailedDataSheetNames,
        } = await this.handleAddToSpreadsheetsResponse(
            addToSpreadsheetsResponse,
            dataSheet,
            {
                interaction,
                dataToLog: {
                    fromSheet,
                    toSheet,
                    nameToSearch,
                    fromSpreadsheetInfo,
                    toSpreadsheetInfo,
                },
            }
        );

        await this.sendSuccessMessage({
            interaction,
            dataSheet,
            fromSheet,
            nameToSearch,
            successfulSpreadsheetNames,
            partiallyFailedDataSheetNames,
        });

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
        spreadsheetIds,
        dataSheetName,
    }: {
        spreadsheetIds: string[];
        dataSheetName: PtuDataSheetName;
    }): Promise<string[][][] | GoogleSheetsApiErrorType | undefined>
    {

        // Parse data for the spreadsheet
        const ranges = spreadsheetIds.reduce<GoogleSheetsGetRangeParametersV1[]>((acc, spreadsheetId) => {
            acc.push({
                spreadsheetId,
                range: `'${dataSheetName}'!A:AZ`,
            });

            if (dataSheetName === PtuDataSheetName.PokemonData)
            {
                acc.push({
                    spreadsheetId,
                    range: `'Pokemon Skills'!A:AZ`,
                });
            }

            return acc;
        }, []);

        // Get data from the spreadsheet
        const {
            data: [
                {
                    valueRanges = [],
                } = {},
            ] = [{}],
            errorType,
        } = await CachedGoogleSheetsApiService.getRanges({
            ranges,
            shouldNotCache: true,
        });

        if (errorType)
        {
            return errorType;
        }

        return valueRanges.map(({ values = [] }) => values);
    }

    private static parseGetData({
        data,
        dataSheet,
        nameToSearch,
        toSpreadsheetInfo,
    }: {
        data: string[][][];
        dataSheet: PtuDataSheetName;
        nameToSearch: string;
        toSpreadsheetInfo: GetSpreadsheetInfoResponse;
    })
    {
        const findCallback = ([name]: string[]) => {
            return name.trim().toLowerCase() === nameToSearch.trim().toLowerCase();
        };

        if (dataSheet === PtuDataSheetName.PokemonData)
        {
            const [
                fromPokemonData,
                fromPokemonSkills,
                ...unparsedToData
            ] = data;

            const toData: {
                isInPokemonData: boolean;
                isInPokemonSkills: boolean;
                spreadsheetData: SpreadsheetData;
            }[] = [];

            for (let index = 0; index < unparsedToData.length; index += 2)
            {
                const pokemonData = unparsedToData[index];
                const pokemonSkills = unparsedToData[index + 1];

                toData.push({
                    isInPokemonData: !!pokemonData.find(findCallback),
                    isInPokemonSkills: !!pokemonSkills.find(findCallback),
                    spreadsheetData: toSpreadsheetInfo.spreadsheetData![index],
                });
            }

            return {
                fromData: {
                    pokemonData: fromPokemonData.find(findCallback),
                    pokemonSkills: fromPokemonSkills.find(findCallback),
                },
                toData,
            };
        }

        const [
            fromData,
            ...toData
        ] = data;

        return {
            fromData: fromData.find(findCallback),
            // TODO: Fix this callback later, it's just to get it working for now, this probably isn't what we want
            toData: toData.find((nestedToData) => !!nestedToData.find(findCallback))!,
        };
    }

    private static async addToSpreadsheets({
        spreadsheetData = [],
        dataSheetName,
        dataRow,
        dataRow2,
    }: {
        spreadsheetData: SpreadsheetData[];
        dataSheetName: PtuDataSheetName;
        dataRow: string[];
        dataRow2?: string[];
    })
    {
        const handlerMap: Record<PtuDataSheetName, () => Promise<AddToSpreadsheetsResponse[]>> = {
            [PtuDataSheetName.PokemonData]: async () =>
            {
                const promises = spreadsheetData.reduce<Promise<AddToSpreadsheetsResponse | undefined>[]>((
                    acc,
                    { id, name },
                ) => {
                    const appendToSheet = (range: string, curDataRow: string[]) => CachedGoogleSheetsApiService.append({
                        range,
                        spreadsheetId: id,
                        values: [curDataRow],
                        shouldNotCache: true,
                    })
                    .then(({ errorType }) => ({
                        id,
                        name,
                        errorType,
                    }))
                    .catch((_) => {
                        logger.error(`Failed to append data in ${this.name}.addToSpreadsheets.`, {
                            spreadsheetId: id,
                            sheetName: name,
                            dataSheetName,
                            dataRow: curDataRow,
                            range,
                        });
                        return undefined;
                    });

                    acc.push(
                        appendToSheet(`'${dataSheetName}'!A:AZ`, dataRow),
                        appendToSheet(`'Pokemon Skills'!A:AZ`, dataRow2 as string[]),
                    );
                    return acc;
                }, []);

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
        dataSheet: PtuDataSheetName,
        errorParameters: Omit<
            SendReplyForGoogleSheetsErrorTypeParameters,
            'interactionMethod' | 'sheetName' | 'errorType' | 'dataSheet'
        >,
    ): Promise<HandleAddToSpreadsheetsResponseResponse>
    {
        const failedSpreadsheetNames = new Set<PtuSheetName | PtuCharacterSheetName>();
        const partiallyFailedDataSheetNames: HandleAddToSpreadsheetsResponseResponse['partiallyFailedDataSheetNames'] = [];
        const successfulSpreadsheetNames = new Set<HandleAddToSpreadsheetsResponseResponse['successfulSpreadsheetNames'][0]>();

        for (const response of addToSpreadsheetsResponse)
        {
            const {
                id,
                name,
                errorType,
            } = response;

            if (errorType)
            {
                const actualDataSheet = (
                    failedSpreadsheetNames.has(name)
                    && dataSheet === PtuDataSheetName.PokemonData
                )
                ? 'Pokemon Skills'
                : dataSheet;

                await this.sendReplyForGoogleSheetsErrorType({
                    ...errorParameters,
                    interactionMethod: 'followUp',
                    sheetName: name,
                    errorType,
                    dataToLog: {
                        ...errorParameters.dataToLog,
                        dataSheet: actualDataSheet,
                        errorType,
                        spreadsheetId: id,
                        spreadsheetName: name,
                    },
                });
                failedSpreadsheetNames.add(name);

                if (successfulSpreadsheetNames.has(name))
                {
                    partiallyFailedDataSheetNames.push(actualDataSheet);
                    successfulSpreadsheetNames.delete(name);
                }
            }

            else
            {
                successfulSpreadsheetNames.add(name);
            }
        }

        return {
            successfulSpreadsheetNames: [...successfulSpreadsheetNames],
            partiallyFailedDataSheetNames,
        };
    }

    private static async sendSuccessMessage({
        interaction,
        dataSheet,
        fromSheet,
        nameToSearch,
        successfulSpreadsheetNames,
        partiallyFailedDataSheetNames,
    }: {
        interaction: ChatInputCommandInteraction;
        dataSheet: PtuDataSheetName;
        fromSheet: PtuSheetName | PtuCharacterSheetName;
        nameToSearch: string;
    } & HandleAddToSpreadsheetsResponseResponse)
    {
        const combinedSuccessfulSpreadsheetNames = successfulSpreadsheetNames.join(', ');

        const partialSuccessMessage = partiallyFailedDataSheetNames.reduce((acc, dataSheet) =>
        {
            acc += `\n- to ${dataSheet} but succeeded on `;

            if (dataSheet === PtuDataSheetName.PokemonData)
            {
                acc += 'Pokemon Skills';
            }
            else if (dataSheet === 'Pokemon Skills')
            {
                acc += PtuDataSheetName.PokemonData;
            }

            return acc;
        }, partiallyFailedDataSheetNames.length > 0 ? '\nAdditionally, failed to copy:' : '');

        await interaction.editReply(
            `Successfully copied ${Text.Code.oneLine(nameToSearch)} `
            + `on the ${Text.Code.oneLine(dataSheet)} page `
            + `from ${Text.Code.oneLine(fromSheet)} `
            + `to ${Text.Code.oneLine(combinedSuccessfulSpreadsheetNames)}`
            + partialSuccessMessage
        );
    }
}
