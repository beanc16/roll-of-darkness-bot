import { CachedGoogleSheetsApiService } from '../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import {
    GoogleSheetsApiErrorType,
    type GoogleSheetsGetPageTitlesBatchResponse,
    type GoogleSheetsGetRangesResponse,
} from '../../../services/CachedGoogleSheetsApiService/types.js';
import { characterSheetSpreadsheetIds } from '../constants.js';
import { getFakeSpreadsheetId, getFakeSpreadsheetIds } from '../fakes/spreadsheets.js';
import {
    CharacterSheetStrategy,
    GetNicknamesOptions,
    GetNicknamesResponse,
    GetSpreadsheetValuesBatchResponse,
    GetSpreadsheetValuesOptions,
    GetSpreadsheetValuesResponse,
} from './CharacterSheetStrategy.js';

// This mock is necessary to prevent an ESM export error with @swc/jest
jest.mock('@beanc16/microservices-abstraction', () =>
{
    return {
        GoogleSheetsMicroservice: jest.fn(),
        GoogleSheetsMicroserviceFilterType: {
            CaseInsensitiveExcludes: 'case_insensitive_excludes',
        },
    };
});

const mockedCachedGoogleSheetsApiService = jest.mock('../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js');

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
                expectedResult.toString(),
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
        let spreadsheetIds: string[];
        let pokemonName: string;
        let validGetRangesResponse: GoogleSheetsGetRangesResponse;

        beforeEach(() =>
        {
            spreadsheetId = getFakeSpreadsheetId();
            spreadsheetIds = getFakeSpreadsheetIds(3);
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
            it('should return parsed data when the API successfully returns the correct response structure', async () =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue(
                    validGetRangesResponse,
                );

                const result = await CharacterSheetStrategy['getSpreadsheetValues']({ spreadsheetId, pokemonName });
                const expectedResult: GetSpreadsheetValuesResponse = {
                    pageName: 'Pikachu',
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
                Object.entries(GoogleSheetsApiErrorType),
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
            let input: GetSpreadsheetValuesOptions[];

            beforeEach(() =>
            {
                input = spreadsheetIds.map((curSpreadsheetId) =>
                {
                    return { spreadsheetId: curSpreadsheetId, pokemonName };
                });
            });

            it('should return parsed data for a valid batch request', async () =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    data: spreadsheetIds.map((curSpreadsheetId) =>
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

                const expectedResult = spreadsheetIds.map<GetSpreadsheetValuesBatchResponse>((curSpreadsheetId) =>
                {
                    return {
                        spreadsheetId: curSpreadsheetId,
                        values: {
                            pageName: 'Pikachu',
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
                Object.entries(GoogleSheetsApiErrorType),
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

            it('should return undefined if the value ranges length does not match the expected ranges length', async () =>
            {
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

            it('should return undefined if the API response is malformed', async () =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    // No data or errorType
                });

                const result = await CharacterSheetStrategy['getBatchSpreadsheetValues'](
                    input,
                );

                expect(result).toBeUndefined();
            });
        });

        describe('method: getNicknames', () =>
        {
            let input: GetNicknamesOptions[];

            beforeEach(() =>
            {
                input = spreadsheetIds.map<GetNicknamesOptions>((curSpreadsheetId) =>
                {
                    return { spreadsheetId: curSpreadsheetId, pokemonNames: ['Pikachu'] };
                });
            });

            it('should return parsed data for a valid batch request', async () =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    data: spreadsheetIds.map((curSpreadsheetId) =>
                    {
                        return {
                            ...validGetRangesResponse.data![0],
                            spreadsheetId: curSpreadsheetId,
                        };
                    }),
                } as GoogleSheetsGetRangesResponse);

                const result = await CharacterSheetStrategy['getNicknames'](
                    input,
                );

                const expectedResult = spreadsheetIds.map<GetNicknamesResponse>((curSpreadsheetId) =>
                {
                    return {
                        spreadsheetId: curSpreadsheetId,
                        names: [{
                            nickname: 'Pika',
                            pageName: 'Pikachu',
                            startingLevel: 49,
                        }],
                    };
                });
                expect(result).toEqual(expectedResult);
            });

            it.each(
                Object.entries(GoogleSheetsApiErrorType),
            )('should return %s error type if API returns an error', async (_, errorType) =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    errorType,
                });

                const result = await CharacterSheetStrategy['getNicknames'](
                    input,
                );

                expect(result).toEqual(errorType);
            });

            it('should return undefined if the value ranges length does not match the expected ranges length', async () =>
            {
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

                const result = await CharacterSheetStrategy['getNicknames'](
                    input,
                );

                expect(result).toBeUndefined();
            });

            it('should return undefined if the API response is malformed', async () =>
            {
                mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getRanges').mockResolvedValue({
                    // No data or errorType
                });

                const result = await CharacterSheetStrategy['getNicknames'](
                    input,
                );

                expect(result).toBeUndefined();
            });
        });
    });

    describe('method: getAllPokemonNames', () =>
    {
        let validGetPageTitlesBatchResponse: GoogleSheetsGetPageTitlesBatchResponse;

        beforeEach(() =>
        {
            validGetPageTitlesBatchResponse = {
                spreadsheets: characterSheetSpreadsheetIds.map((spreadsheetId) =>
                {
                    return {
                        spreadsheetId,
                        titles: ['Pikachu'],
                    };
                }),
            };
        });

        it('should return an array of spreadsheets with titles when no error occurs', async () =>
        {
            mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getPageTitlesBatch').mockResolvedValue(
                validGetPageTitlesBatchResponse,
            );

            const result = await CharacterSheetStrategy['getAllPokemonNames'](characterSheetSpreadsheetIds);
            const spreadsheetMetadata = characterSheetSpreadsheetIds.map((spreadsheetId) =>
            {
                return { spreadsheetId };
            });

            expect(result).toEqual(validGetPageTitlesBatchResponse.spreadsheets);
            expect(CachedGoogleSheetsApiService['getPageTitlesBatch']).toHaveBeenCalledWith({
                spreadsheetMetadata,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We want to expect any array
                filters: expect.any(Array),
            });
        });

        it.each(
            Object.entries(GoogleSheetsApiErrorType),
        )('should return %s error type if API returns an error', async (_, errorType) =>
        {
            mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getPageTitlesBatch').mockResolvedValue({
                errorType,
            });

            const result = await CharacterSheetStrategy['getAllPokemonNames'](characterSheetSpreadsheetIds);

            expect(result).toEqual(errorType);
        });

        it('should return undefined if the API response is empty', async () =>
        {
            mockedCachedGoogleSheetsApiService.spyOn(CachedGoogleSheetsApiService, 'getPageTitlesBatch').mockResolvedValue({
                // No data or errorType
            });

            const result = await CharacterSheetStrategy['getAllPokemonNames'](characterSheetSpreadsheetIds);

            expect(result).toBeUndefined();
        });
    });
});
