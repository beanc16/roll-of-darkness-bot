import type { GoogleSheetsGetRangeParametersV1 } from '@beanc16/microservices-abstraction';

import { CachedGoogleSheetsApiService } from '../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { GoogleSheetsApiErrorType } from '../../../services/CachedGoogleSheetsApiService/types.js';

interface GetSpreadsheetValuesOptions
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

export class CharacterSheetStrategy
{
    protected static baseSpreadsheetRangesToGet = {
        nickname: 'A1:B1',
        species: 'H1:J1',
        totalExp: 'D2:H2',
        trainingExp: 'L10:N10',
        level: 'B2',
    };

    protected static async getBatchSpreadsheetValues(input: GetSpreadsheetValuesOptions[]): Promise<GetSpreadsheetValuesBatchResponse[] | GoogleSheetsApiErrorType | undefined>
    {
        // Parse input data for the spreadsheets
        const { ranges, spreadsheetIdsSet } = input.reduce<{
            ranges: GoogleSheetsGetRangeParametersV1[];
            spreadsheetIdsSet: Set<string>;
        }>((acc, cur) =>
        {
            const { pokemonName, spreadsheetId } = cur;

            spreadsheetIdsSet.add(spreadsheetId);

            Object.values(this.baseSpreadsheetRangesToGet).forEach((range) =>
            {
                acc.ranges.push({
                    spreadsheetId,
                    range: `'${pokemonName}'!${range}`,
                });
            });

            return acc;
        }, { ranges: [], spreadsheetIdsSet: new Set<string>() });

        // Get data from the spreadsheet
        const {
            data = [],
            errorType,
        } = await CachedGoogleSheetsApiService.getRanges({
            ranges,
            shouldNotCache: true,
        }) ?? [];

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
        return data.map<GetSpreadsheetValuesBatchResponse>(({ spreadsheetId, valueRanges = [] }) =>
        {
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

            return {
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
                    unparsedExpToNextLevel: totalExp,
                    trainingExpLabel,
                    trainingExp: this.parseToInt(trainingExp),
                    unparsedTrainingExp: trainingExp,
                    startingLevel: this.parseToInt(level),
                },
            };
        });
    }

    protected static async getSpreadsheetValues({
        spreadsheetId,
        pokemonName,
    }: GetSpreadsheetValuesOptions): Promise<GetSpreadsheetValuesResponse | GoogleSheetsApiErrorType | undefined>
    {
        /*

        const result = await this.getBatchSpreadsheetValues([input]);

        if (Array.isArray(result))
        {
            const [{ values }] = result;

            return values;
        }

        return result;
        */

        // Parse data for the spreadsheet
        const ranges = Object.values(this.baseSpreadsheetRangesToGet).map((range) => {
            return {
                spreadsheetId,
                range: `'${pokemonName}'!${range}`,
            };
        });

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
        }) ?? [];

        if (errorType)
        {
            return errorType;
        }

        if (ranges.length !== valueRanges.length)
        {
            return undefined;
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

        return {
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
        };
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
}
