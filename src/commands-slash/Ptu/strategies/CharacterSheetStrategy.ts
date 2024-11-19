import type { GoogleSheetsGetRangeParametersV1 } from '@beanc16/microservices-abstraction';

import { CachedGoogleSheetsApiService } from '../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { GoogleSheetsApiErrorType } from '../../../services/CachedGoogleSheetsApiService/types.js';
import { ChatInputCommandInteraction } from 'discord.js';

export interface GetSpreadsheetValuesOptions
{
    spreadsheetId: string;
    pokemonName: string;
}

interface GetSpreadsheetValuesResponse {
    nicknameLabel: string;
    nickname: string;
    speciesLabel: string;
    species: string;
    totalExpLabel: string;
    totalExp?: number;
    unparsedTotalExp: string;
    expToNextLevelLabel: string;
    expToNextLevel?: number;
    unparsedExpToNextLevel: string;
    trainingExpLabel: string;
    trainingExp?: number;
    unparsedTrainingExp: string;
    startingLevel?: number;
}

interface GetSpreadsheetValuesBatchResponse
{
    spreadsheetId: string;
    values: GetSpreadsheetValuesResponse;
}

interface GetNicknameResponse
{
    nicknameLabel: string;
    nickname: string;
}

export class CharacterSheetStrategy
{
    protected static baseSpreadsheetRangesToGet = {
        nickname: 'A1:B1',
        species: 'H1:J1',
        totalExp: 'D2:H2',
        trainingExp: 'L10:N10',
        level: 'B2',
    };

    // Does full success or failures, no partial successes
    protected static async getBatchSpreadsheetValues(input: GetSpreadsheetValuesOptions[]): Promise<GetSpreadsheetValuesBatchResponse[] | GoogleSheetsApiErrorType | undefined>
    {
        // Parse input data for the spreadsheets
        const {
            ranges,
            spreadsheetIdsSet,
            spreadsheetIdToNumOfExpectedValueRanges,
        } = input.reduce<{
            ranges: GoogleSheetsGetRangeParametersV1[];
            spreadsheetIdsSet: Set<string>;
            spreadsheetIdToNumOfExpectedValueRanges: Record<string, number>;
        }>((acc, cur) =>
        {
            const { pokemonName, spreadsheetId } = cur;

            acc.spreadsheetIdsSet.add(spreadsheetId);

            if (!acc.spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId])
            {
                acc.spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId] = 0;
            }

            Object.values(this.baseSpreadsheetRangesToGet).forEach((range) =>
            {
                acc.spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId] += 1;
                acc.ranges.push({
                    spreadsheetId,
                    range: `'${pokemonName}'!${range}`,
                });
            });

            return acc;
        }, {
            ranges: [],
            spreadsheetIdsSet: new Set<string>(),
            spreadsheetIdToNumOfExpectedValueRanges: {},
        });

        // Get data from the spreadsheet
        const {
            data = [],
            errorType,
        } = await CachedGoogleSheetsApiService.getRanges({
            ranges,
            shouldNotCache: true,
        });

        // There was an error
        if (errorType)
        {
            return errorType;
        }

        // We didn't receive data for the same number of spreadsheets in the output that were in the input
        if (data.length !== spreadsheetIdsSet.size)
        {
            return undefined;
        }

        // Parse output
        const { output, receivedUnexpectedNumberOfValueRanges } = data.reduce<{
            output: GetSpreadsheetValuesBatchResponse[];
            receivedUnexpectedNumberOfValueRanges: boolean;
        }>((acc, { spreadsheetId, valueRanges = [] }) =>
        {
            const numOfExpectedValueRanges = spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId];

            if (numOfExpectedValueRanges !== valueRanges.length)
            {
                acc.receivedUnexpectedNumberOfValueRanges = true;
                return acc;
            }

            const [
                {
                    values: [
                        [
                            nicknameLabel,
                            nickname,
                        ],
                    ] = [[]],
                } = {},
                {
                    values: [
                        [
                            speciesLabel,
                            _1,
                            species,
                        ],
                    ] = [[]],
                } = {},
                {
                    values: [
                        [
                            totalExpLabel,
                            totalExp,
                            _2,
                            expToNextLevelLabel,
                            expToNextLevel,
                        ],
                    ] = [[]],
                } = {},
                {
                    values: [
                        [
                            trainingExpLabel,
                            _3,
                            trainingExp,
                        ],
                    ] = [[]],
                } = {},
                {
                    values: [
                        [
                            level,
                        ],
                    ] = [[]],
                } = {},
            ] = valueRanges;

            acc.output.push({
                spreadsheetId,
                values: {
                    nicknameLabel,
                    nickname,
                    speciesLabel,
                    species,
                    totalExpLabel,
                    totalExp: this.parseToInt(totalExp),
                    unparsedTotalExp: totalExp,
                    expToNextLevelLabel,
                    expToNextLevel: this.parseToInt(expToNextLevel),
                    unparsedExpToNextLevel: expToNextLevel,
                    trainingExpLabel,
                    trainingExp: this.parseToInt(trainingExp),
                    unparsedTrainingExp: trainingExp,
                    startingLevel: this.parseToInt(level),
                },
            });

            return acc;
        }, {
            output: [],
            receivedUnexpectedNumberOfValueRanges: false,
        });

        if (receivedUnexpectedNumberOfValueRanges)
        {
            return undefined;
        }

        return output;
    }

    protected static async getSpreadsheetValues(input: GetSpreadsheetValuesOptions): Promise<GetSpreadsheetValuesResponse | GoogleSheetsApiErrorType | undefined>
    {
        const result = await this.getBatchSpreadsheetValues([input]);

        if (Array.isArray(result))
        {
            const [{ values }] = result;

            return values;
        }

        return result;
    }

    protected static async getNickname({
        spreadsheetId,
        pokemonName,
    }: {
        spreadsheetId: string;
        pokemonName: string;
    }): Promise<GetNicknameResponse>
    {
        const {
            data: [
                [nicknameLabel, nickname]
            ] = [[]],
        } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId,
            range: `'${pokemonName}'!${this.baseSpreadsheetRangesToGet.nickname}`,
            shouldNotCache: true,
        });

        return {
            nicknameLabel,
            nickname,
        };
    }

    protected static async getLevel({
        spreadsheetId,
        pokemonName,
    }: {
        spreadsheetId: string;
        pokemonName: string;
    }): Promise<number | undefined>
    {
        const {
            data: [
                [level]
            ] = [[]],
        } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId,
            range: `'${pokemonName}'!${this.baseSpreadsheetRangesToGet.level}`,
            shouldNotCache: true,
        });

        return this.parseToInt(level);
    }

    protected static parseToInt(input: string): number | undefined
    {
        const output = parseInt(input, 10);

        if (Number.isNaN(output))
        {
            return undefined;
        }

        return output;
    }

    protected static async handleGoogleSheetsApiError(
        errorType: GoogleSheetsApiErrorType | undefined,
        errorTypeToCallbackMap: Partial<Record<GoogleSheetsApiErrorType, () => Promise<any>>>
    ): Promise<boolean>
    {
        if (errorType === undefined || !errorTypeToCallbackMap[errorType])
        {
            return false;
        }

        await errorTypeToCallbackMap[errorType]();
        return true;
    }

    protected static async sendPermissionError({
        interaction,
        commandName,
        action,
        maxActionPermission = 'edit',
    }: {
        interaction: ChatInputCommandInteraction;
        commandName: `/${string}`;
        action: 'view' | 'edit';
        maxActionPermission?: 'view' | 'edit';
    }): Promise<void>
    {
        const howToShareSpreadsheetsHelpArticle = 'https://support.google.com/docs/answer/9331169?hl=en#6.1';

        await interaction.editReply(
            `I don't have permission to ${action} that character sheet. You will be DM'd instructions for how to give me ${maxActionPermission} permissions here shortly.`
        );

        const maxActionPermissionToRoleName: Record<'view' | 'edit', string> = {
            view: 'viewer',
            edit: 'editor',
        };

        await interaction.user.send(
            `If you want to use \`${commandName}\`, then I need ${maxActionPermission} access on your character sheet. ` +
            `If you aren't sure how to give me ${maxActionPermission} permissions, please follow this guide:\n${howToShareSpreadsheetsHelpArticle}.\n\n` +
            `You can either make your sheet editable by anyone with the URL or add this email as an ${maxActionPermissionToRoleName[maxActionPermission]} (whichever you prefer):\n\`${process.env.GOOGLE_SHEETS_MICROSERVICE_EMAIL_ADDRESS}\``
        );
    }
}
