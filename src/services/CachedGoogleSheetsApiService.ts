import {
    GoogleSheetsAppendParametersV1,
    GoogleSheetsGetRangeParametersV1,
    GoogleSheetsGetRangesParametersV1,
    GoogleSheetsGetRangesResponseV1,
    GoogleSheetsMicroservice,
    GoogleSheetsUpdateParametersV1,
} from '@beanc16/microservices-abstraction';
import { CachedAuthTokenService } from './CachedAuthTokenService.js';
import { logger } from '@beanc16/logger';
import { CompositeKeyRecord } from './CompositeKeyRecord.js';
import { Timer } from './Timer.js';

export enum GoogleSheetsApiErrorType {
    UserNotAddedToSheet = 'AUTOMATED_USER_NOT_ADDED_TO_SHEET',
    UnableToParseRange = 'UNABLE_TO_PARSE_RANGE',
}

interface CachedGoogleSheetsGetRangeResponse
{
    data?: string[][];
    errorType?: GoogleSheetsApiErrorType;
}

interface CachedGoogleSheetsGetRangesResponse
{
    data?: GoogleSheetsGetRangesResponseV1['data'];
    errorType?: GoogleSheetsApiErrorType;
}

export interface CachedGoogleSheetsUpdateResponse
{
    errorType?: GoogleSheetsApiErrorType;
}

interface WithCacheOptions
{
    shouldNotCache?: boolean;
}

export class CachedGoogleSheetsApiService
{
    static #retries = 4;
    static #cache: CompositeKeyRecord<[string, string], string[][]> = new CompositeKeyRecord();

    static async getRange(initialParameters: GoogleSheetsGetRangeParametersV1 & WithCacheOptions): Promise<CachedGoogleSheetsGetRangeResponse>
    {
        const {
            shouldNotCache = false,
            ...parameters
        } = initialParameters;

        const cacheSpreadsheetKey = parameters?.spreadsheet || parameters?.spreadsheetId as string;
        const cacheRangeKey = parameters?.range as string;

        const cachedData = this.#cache.Get([cacheSpreadsheetKey, cacheRangeKey]);

        if (cachedData !== undefined)
        {
            return {
                data: cachedData,
            };
        }

        for (let i = 0; i <= this.#retries; i += 1)
        {
            const authToken = await CachedAuthTokenService.getAuthToken();

            try
            {
                const {
                    statusCode = 200,
                    data = [],
                    error,
                } = await GoogleSheetsMicroservice.v1.getRange(authToken, parameters);

                if (statusCode === 200)
                {
                    // Save to cache by spreadsheet / spreadsheetId
                    if (!shouldNotCache)
                    {
                        this.#cache.Add([cacheSpreadsheetKey, cacheRangeKey], data);
                    }
                    return { data };
                }

                else if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.getRange. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                    continue;
                }

                else if (
                    statusCode === 400
                    && (error as { message?: string; }).message?.includes('Unable to parse range'))
                {
                    return {
                        errorType: GoogleSheetsApiErrorType.UnableToParseRange,
                    };
                }

                logger.error('An unknown error occurred on GoogleSheetsMicroservice.v1.getRange', { statusCode }, data, (error as any)?.response);
                throw error;
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                if ((error as any)?.response?.data?.statusCode === 403)
                {
                    logger.warn('The automated user is not added to the queried sheet. Please add them.', {
                        ...(parameters?.spreadsheetId && {
                            spreadsheetId: parameters?.spreadsheetId,
                        }),
                        ...(parameters?.spreadsheet && {
                            spreadsheet: parameters?.spreadsheet,
                        }),
                    });
                    return {
                        errorType: GoogleSheetsApiErrorType.UserNotAddedToSheet,
                    };
                }

                else
                {
                    logger.error('An error occurred on GoogleSheetsMicroservice.v1.getRange', (error as any)?.response?.data || error);
                }
            }
        }

        return {};
    }

    static async getRanges(initialParameters: GoogleSheetsGetRangesParametersV1 & WithCacheOptions): Promise<CachedGoogleSheetsGetRangesResponse>
    {
        const {
            shouldNotCache = false, // Add caching so this does something later
            ...parameters
        } = initialParameters;

        for (let i = 0; i <= this.#retries; i += 1)
        {
            const authToken = await CachedAuthTokenService.getAuthToken();

            try
            {
                const {
                    statusCode = 200,
                    data = [],
                    error,
                } = await GoogleSheetsMicroservice.v1.getRanges(authToken, parameters);

                if (statusCode === 200)
                {
                    return { data };
                }

                else if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.getRanges. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                    continue;
                }

                throw error;
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                if ((error as any)?.response?.data?.statusCode === 403)
                {
                    logger.warn('The automated user is not added to the queried sheet. Please add them.', {
                        ...(parameters?.ranges && {
                            ranges: parameters?.ranges,
                        }),
                    });
                    return {
                        errorType: GoogleSheetsApiErrorType.UserNotAddedToSheet,
                    };
                }

                else if (
                    (error as any)?.response?.data?.statusCode === 400
                    && (error as any)?.response?.data?.error?.message?.includes('Unable to parse range')
                )
                {
                    return {
                        errorType: GoogleSheetsApiErrorType.UnableToParseRange,
                    };
                }

                else
                {
                    logger.error('An error occurred on GoogleSheetsMicroservice.v1.getRanges', (error as any)?.response?.data || error);
                }
            }

            // Wait half a second between retries
            await Timer.wait({
                seconds: 0.5,
            });
        }

        return {};
    }

    static async update(initialParameters: GoogleSheetsUpdateParametersV1 & WithCacheOptions): Promise<CachedGoogleSheetsUpdateResponse>
    {
        const {
            shouldNotCache = false,
            ...parameters
        } = initialParameters;

        const cacheSpreadsheetKey = parameters?.spreadsheet || parameters?.spreadsheetId as string;
        const cacheRangeKey = parameters?.range as string;

        for (let i = 0; i <= this.#retries; i += 1)
        {
            const authToken = await CachedAuthTokenService.getAuthToken();

            try
            {
                const {
                    statusCode = 200,
                    data = [],
                    error,
                } = await GoogleSheetsMicroservice.v1.update(authToken, parameters);

                if (statusCode === 200)
                {
                    // Save to cache by spreadsheet / spreadsheetId
                    if (!shouldNotCache)
                    {
                        this.#cache.Add([cacheSpreadsheetKey, cacheRangeKey], parameters?.values as string[][]);
                    }

                    return {};
                }

                else if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.update. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                    continue;
                }

                logger.error('An unknown error occurred on GoogleSheetsMicroservice.v1.update', { statusCode }, data, (error as any)?.response);
                throw error;
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                if ((error as any)?.response?.data?.statusCode === 403)
                {
                    logger.warn('The automated user is not added to the queried sheet. Please add them.', {
                        ...(parameters?.spreadsheetId && {
                            spreadsheetId: parameters?.spreadsheetId,
                        }),
                        ...(parameters?.spreadsheet && {
                            spreadsheet: parameters?.spreadsheet,
                        }),
                    });
                    return {
                        errorType: GoogleSheetsApiErrorType.UserNotAddedToSheet,
                    };
                }

                else
                {
                    logger.error('An error occurred on GoogleSheetsMicroservice.v1.update', (error as any)?.response?.data || error);
                }
            }
        }

        return {};
    }

    static async append(initialParameters: GoogleSheetsAppendParametersV1 & WithCacheOptions): Promise<CachedGoogleSheetsUpdateResponse>
    {
        const {
            shouldNotCache = false,
            ...parameters
        } = initialParameters;

        const cacheSpreadsheetKey = parameters?.spreadsheet || parameters?.spreadsheetId as string;
        const cacheRangeKey = parameters?.range as string;

        for (let i = 0; i <= this.#retries; i += 1)
        {
            const authToken = await CachedAuthTokenService.getAuthToken();

            try
            {
                const {
                    statusCode = 200,
                    data = [],
                    error,
                } = await GoogleSheetsMicroservice.v1.append(authToken, parameters);

                if (statusCode === 200)
                {
                    // Save to cache by spreadsheet / spreadsheetId
                    if (!shouldNotCache)
                    {
                        this.#cache.Add([cacheSpreadsheetKey, cacheRangeKey], parameters?.values as string[][]);
                    }

                    return {};
                }

                else if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.append. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                    continue;
                }

                logger.error('An unknown error occurred on GoogleSheetsMicroservice.v1.append', { statusCode }, data, (error as any)?.response);
                throw error;
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                if ((error as any)?.response?.data?.statusCode === 403)
                {
                    logger.warn('The automated user is not added to the queried sheet. Please add them.', {
                        ...(parameters?.spreadsheetId && {
                            spreadsheetId: parameters?.spreadsheetId,
                        }),
                        ...(parameters?.spreadsheet && {
                            spreadsheet: parameters?.spreadsheet,
                        }),
                    });
                    return {
                        errorType: GoogleSheetsApiErrorType.UserNotAddedToSheet,
                    };
                }

                else
                {
                    logger.error('An error occurred on GoogleSheetsMicroservice.v1.append', (error as any)?.response?.data || error);
                }
            }
        }

        return {};
    }
}
