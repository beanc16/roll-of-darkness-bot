import { logger } from '@beanc16/logger';
import {
    GoogleSheetsGetRangeParametersV1,
    GoogleSheetsGetRangesParametersV1,
    GoogleSheetsGetRangesResponseV1,
    GoogleSheetsMicroservice,
    GoogleSheetsUpdateParametersV1,
} from '@beanc16/microservices-abstraction';

import { CachedAuthTokenService } from './CachedAuthTokenService.js';
import { CompositeKeyRecord } from './CompositeKeyRecord.js';
import { Timer } from './Timer.js';

export enum GoogleSheetsApiErrorType
{
    UserNotAddedToSheet = 'AUTOMATED_USER_NOT_ADDED_TO_SHEET',
    UnableToParseRange = 'UNABLE_TO_PARSE_RANGE',
}

interface GetRangeResponse
{
    data?: string[][];
    errorType?: GoogleSheetsApiErrorType;
}

interface GetRangesResponse
{
    data?: GoogleSheetsGetRangesResponseV1['data'];
    errorType?: GoogleSheetsApiErrorType;
}

interface UpdateResponse
{
    errorType?: GoogleSheetsApiErrorType;
}

interface WithCacheOptions
{
    shouldNotCache?: boolean;
}

/* eslint-disable no-await-in-loop */ // We want to do asynchronous retries, so allow awaits in loops
export class CachedGoogleSheetsApiService
{
    private static retries = 4;
    private static cache: CompositeKeyRecord<[string, string], string[][]> = new CompositeKeyRecord();

    public static async getRange(initialParameters: GoogleSheetsGetRangeParametersV1 & WithCacheOptions): Promise<GetRangeResponse>
    {
        const {
            shouldNotCache = false,
            ...parameters
        } = initialParameters;

        const cacheSpreadsheetKey = parameters?.spreadsheet || parameters?.spreadsheetId as string;
        const cacheRangeKey = parameters?.range as string;

        const cachedData = this.cache.Get([cacheSpreadsheetKey, cacheRangeKey]);

        if (cachedData !== undefined)
        {
            return {
                data: cachedData,
            };
        }

        for (let i = 0; i <= this.retries; i += 1)
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
                        this.cache.Upsert([cacheSpreadsheetKey, cacheRangeKey], data);
                    }
                    return { data };
                }

                if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.getRange. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                }

                else if (
                    statusCode === 400
                    && (error as { message?: string }).message?.includes('Unable to parse range'))
                {
                    return {
                        errorType: GoogleSheetsApiErrorType.UnableToParseRange,
                    };
                }

                else
                {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                    logger.error('An unknown error occurred on GoogleSheetsMicroservice.v1.getRange', { statusCode }, data, (error as any)?.response);
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal -- TODO: Fix this later
                    throw error;
                }
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
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

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                logger.error('An error occurred on GoogleSheetsMicroservice.v1.getRange', (error as any)?.response?.data || error);
            }
        }

        return {};
    }

    public static async getRanges(initialParameters: GoogleSheetsGetRangesParametersV1 & WithCacheOptions): Promise<GetRangesResponse>
    {
        const {
            shouldNotCache = false, // Add caching so this does something later
            ...parameters
        } = initialParameters;

        for (let i = 0; i <= this.retries; i += 1)
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
                    // Save to cache by spreadsheet / spreadsheetId
                    if (!shouldNotCache)
                    {
                        data.forEach(({ spreadsheetId, valueRanges }) =>
                        {
                            valueRanges.forEach(({ range, values }) =>
                            {
                                this.cache.Upsert([spreadsheetId, range], values);
                            });
                        });
                    }

                    return { data };
                }

                if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.getRanges. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                }

                else
                {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal -- TODO: Fix this later
                    throw error;
                }
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
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

                if (
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                    (error as any)?.response?.data?.statusCode === 400
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call -- Fix this later if necessary
                    && (error as any)?.response?.data?.error?.message?.includes('Unable to parse range')
                )
                {
                    return {
                        errorType: GoogleSheetsApiErrorType.UnableToParseRange,
                    };
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                logger.error('An error occurred on GoogleSheetsMicroservice.v1.getRanges', (error as any)?.response?.data || error);
            }

            // Wait half a second between retries
            await Timer.wait({
                seconds: 0.5,
            });
        }

        return {};
    }

    public static async update(initialParameters: GoogleSheetsUpdateParametersV1 & WithCacheOptions): Promise<UpdateResponse>
    {
        const {
            shouldNotCache = false,
            ...parameters
        } = initialParameters;

        const cacheSpreadsheetKey = parameters?.spreadsheet || parameters?.spreadsheetId as string;
        const cacheRangeKey = parameters?.range as string;

        for (let i = 0; i <= this.retries; i += 1)
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
                        this.cache.Upsert([cacheSpreadsheetKey, cacheRangeKey], parameters?.values as string[][]);
                    }

                    return {};
                }

                if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.update. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                }

                else
                {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                    logger.error('An unknown error occurred on GoogleSheetsMicroservice.v1.update', { statusCode }, data, (error as any)?.response);
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal -- TODO: Fix this later
                    throw error;
                }
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
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

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                logger.error('An error occurred on GoogleSheetsMicroservice.v1.update', (error as any)?.response?.data || error);
            }
        }

        return {};
    }

    // TODO: Make ptu or ptu_admin command that calls this
    public static clearCache(keys?: [string, string]): void
    {
        this.cache.Clear(keys);
    }
}
