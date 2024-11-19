import {
    CharacterSheetStrategy,
    GetSpreadsheetValuesBatchResponse,
    GetSpreadsheetValuesOptions,
    GetSpreadsheetValuesResponse,
} from '../../../../../src/commands-slash/Ptu/strategies/CharacterSheetStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../../src/services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { GoogleSheetsApiErrorType, GoogleSheetsGetRangesResponse } from '../../../../../src/services/CachedGoogleSheetsApiService/types.js';

// This mock is necessary to prevent an ESM export error with @swc/jest
jest.mock('@beanc16/microservices-abstraction', () =>
({
    GoogleSheetsMicroservice: jest.fn(),
}));

const mockedCachedGoogleSheetsApiService = jest.mock('../../../../../src/services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js');

describe('class: CharacterSheetStrategy', () =>
{
    afterEach(() =>
    {
        jest.clearAllMocks();
    });

    describe('method: parseToInt', () =>
    {
        it('should return a number when a valid string number is provided', () =>
        {
            const expectedResult = 123;
            const result = CharacterSheetStrategy['parseToInt'](
                expectedResult.toString()
            );

            expect(result).toEqual(expectedResult);
        });

        it('should return undefined for an invalid number string', () =>
        {
            const result = CharacterSheetStrategy['parseToInt']('invalid');

            expect(result).toBeUndefined();
        });

        it('should return undefined for an empty string', () =>
        {
            const result = CharacterSheetStrategy['parseToInt']('');

            expect(result).toBeUndefined();
        });
    });

    describe('get spreadsheet data', () =>
    {
        let spreadsheetId: string;
        let pokemonName: string;
        let validGetRangesResponse: GoogleSheetsGetRangesResponse;

        beforeEach(() =>
        {
            spreadsheetId = 'test-spreadsheet-id';
            pokemonName = 'Pikachu';
            validGetRangesResponse = {
                data: [
                    {
                        spreadsheetId,
                        valueRanges: [
                            {
                                majorDimension: 'ROWS',
                                range: `${pokemonName}!${CharacterSheetStrategy['baseSpreadsheetRangesToGet'].nickname}`,
                                values: [['Nickname', 'Pika']],
                            },
                            {
                                majorDimension: 'ROWS',
                                range: `${pokemonName}!${CharacterSheetStrategy['baseSpreadsheetRangesToGet'].species}`,
                                values: [['Species', '', 'Pikachu']],
                            },
                            {
                                majorDimension: 'ROWS',
                                range: `${pokemonName}!${CharacterSheetStrategy['baseSpreadsheetRangesToGet'].totalExp}`,
                                values: [['Total EXP', '3445', '', 'To Next Lvl', '200']],
                            },
                            {
                                majorDimension: 'ROWS',
                                range: `${pokemonName}!${CharacterSheetStrategy['baseSpreadsheetRangesToGet'].trainingExp}`,
                                values: [['Training Exp:', '', '44']],
                            },
                            {
                                majorDimension: 'ROWS',
                                range: `${pokemonName}!${CharacterSheetStrategy['baseSpreadsheetRangesToGet'].level}`,
                                values: [['49']],
                            },
                        ],
                    },
                ],
            };
        });

        describe('method: getSpreadsheetValues', () =>
        {
            it('should return parsed data when the API successfully returns the correct response structure', async () => {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue(
                    validGetRangesResponse
                );

                const result = await CharacterSheetStrategy['getSpreadsheetValues']({ spreadsheetId, pokemonName });
                const expectedResult: GetSpreadsheetValuesResponse = {
                    nicknameLabel: 'Nickname',
                    nickname: 'Pika',
                    speciesLabel: 'Species',
                    species: 'Pikachu',
                    totalExpLabel: 'Total EXP',
                    totalExp: 3445,
                    unparsedTotalExp: '3445',
                    expToNextLevelLabel: 'To Next Lvl',
                    expToNextLevel: 200,
                    unparsedExpToNextLevel: '200',
                    trainingExpLabel: 'Training Exp:',
                    trainingExp: 44,
                    unparsedTrainingExp: '44',
                    startingLevel: 49,
                    isValid: true,
                };

                expect(result).toEqual(expectedResult);
            });

            it.each(
                Object.entries(GoogleSheetsApiErrorType)
            )('should return %s error type if API returns an error', async (_, errorType) =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    errorType,
                });

                const result = await CharacterSheetStrategy['getSpreadsheetValues']({ spreadsheetId, pokemonName });

                expect(result).toEqual(errorType);
            });

            it('should return undefined if the value ranges length does not match the expected ranges length', async () =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    data: [
                        {
                            spreadsheetId,
                            valueRanges: [{
                                majorDimension: 'ROWS',
                                range: `${pokemonName}!${CharacterSheetStrategy['baseSpreadsheetRangesToGet'].nickname}`,
                                values: [['Partial Data']],
                            }],
                        },
                    ],
                });

                const result = await CharacterSheetStrategy['getSpreadsheetValues']({ spreadsheetId, pokemonName });

                expect(result).toBeUndefined();
            });

            it('should return undefined if API response is malformed', async () =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    // No data or errorType
                });

                const result = await CharacterSheetStrategy['getSpreadsheetValues']({ spreadsheetId, pokemonName });

                expect(result).toBeUndefined();
            });
        });

        describe('method: getBatchSpreadsheetValues', () =>
        {
            let spreadsheetIds: string[];
            let input: GetSpreadsheetValuesOptions[];

            beforeEach(() =>
            {
                spreadsheetIds = Array.from(
                    { length: 3 },
                    (_, index) => `${spreadsheetId}-${index}`
                );

                input = spreadsheetIds.map(curSpreadsheetId =>
                {
                    return { spreadsheetId: curSpreadsheetId, pokemonName };
                });
            });

            it('should return parsed data for a valid batch request', async () => {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    data: spreadsheetIds.map(curSpreadsheetId =>
                    {
                        return {
                            ...validGetRangesResponse.data![0],
                            spreadsheetId: curSpreadsheetId,
                        };
                    }),
                } as GoogleSheetsGetRangesResponse);

                const result = await CharacterSheetStrategy['getBatchSpreadsheetValues'](
                    input,
                );

                const expectedResult = spreadsheetIds.map<GetSpreadsheetValuesBatchResponse>(curSpreadsheetId =>
                {
                    return {
                        spreadsheetId: curSpreadsheetId,
                        values: {
                            nicknameLabel: 'Nickname',
                            nickname: 'Pika',
                            speciesLabel: 'Species',
                            species: 'Pikachu',
                            totalExpLabel: 'Total EXP',
                            totalExp: 3445,
                            unparsedTotalExp: '3445',
                            expToNextLevelLabel: 'To Next Lvl',
                            expToNextLevel: 200,
                            unparsedExpToNextLevel: '200',
                            trainingExpLabel: 'Training Exp:',
                            trainingExp: 44,
                            unparsedTrainingExp: '44',
                            startingLevel: 49,
                            isValid: true,
                        },
                    };
                });
                expect(result).toEqual(expectedResult);
            });

            it.each(
                Object.entries(GoogleSheetsApiErrorType)
            )('should return %s error type if API returns an error', async (_, errorType) =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    errorType,
                });

                const result = await CharacterSheetStrategy['getBatchSpreadsheetValues'](
                    input,
                );

                expect(result).toEqual(errorType);
            });

            it('should return undefined if the value ranges length does not match the expected ranges length', async () => {
                const invalidBatchResponse: GoogleSheetsGetRangesResponse = {
                    data: [
                        {
                            spreadsheetId,
                            valueRanges: [
                                {
                                    majorDimension: 'ROWS',
                                    range: `${pokemonName}!${CharacterSheetStrategy['baseSpreadsheetRangesToGet'].nickname}`,
                                    values: [['Nickname', 'Pika']],
                                },
                            ],
                        },
                    ],
                };

                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue(
                    invalidBatchResponse,
                );

                const result = await CharacterSheetStrategy['getBatchSpreadsheetValues'](
                    input,
                );

                expect(result).toBeUndefined();
            });

            it('should return undefined if the API response is malformed', async () => {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    // No data or errorType
                });

                const result = await CharacterSheetStrategy['getBatchSpreadsheetValues'](
                    input,
                );

                expect(result).toBeUndefined();
            });
        });
    });
});