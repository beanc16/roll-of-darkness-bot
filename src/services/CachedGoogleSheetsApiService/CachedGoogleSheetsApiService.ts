import { logger } from '@beanc16/logger';
import type {
    GoogleSheetsGetPageTitlesBatchParametersV1,
    GoogleSheetsGetRangeParametersV1,
    GoogleSheetsGetRangesParametersV1,
    GoogleSheetsMicroserviceFilter,
    GoogleSheetsUpdateParametersV1,
} from '@beanc16/microservices-abstraction';
import { GoogleSheetsMicroservice } from '@beanc16/microservices-abstraction';

import { CachedAuthTokenService } from '../CachedAuthTokenService.js';
import { CompositeKeyRecord } from '../CompositeKeyRecord.js';
import { Timer } from '../Timer.js';
import {
    GoogleSheetsApiErrorType,
    type GoogleSheetsGetPageTitlesBatchResponse,
    type GoogleSheetsGetRangesResponse,
} from './types.js';

export interface RetryOptions
{
    secondsBetweenRetries?: number;
    numOfRetries?: number;
}

interface GetPageTitleCacheKeysByParametersResponse
{
    spreadsheetIdToKeysMap: Record<string, string[]>;
    allMetadataIsCacheable: boolean;
}

interface GetRangeResponse
{
    data?: string[][];
    errorType?: GoogleSheetsApiErrorType;
}

export type GetRangesOptions = GoogleSheetsGetRangesParametersV1 & WithCacheOptions & RetryOptions;

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

    // Key is spreadsheetId, then all filters
    private static pageTitleCache: CompositeKeyRecord<string[], string[]> = new CompositeKeyRecord();

    private static getPageTitleCacheKeys({
        spreadsheetId,
        topLevelFilters = [],
        currentFilters = [],
    }: {
        spreadsheetId: string;
        topLevelFilters?: GoogleSheetsMicroserviceFilter[];
        currentFilters?: GoogleSheetsMicroserviceFilter[];
    }): string[]
    {
        const keys = topLevelFilters.reduce<string[]>((acc, { type, values }) =>
        {
            acc.push(type);
            acc.push(...values);
            return acc;
        }, [spreadsheetId]);

        currentFilters.forEach(({ type, values }) =>
        {
            keys.push(type);
            keys.push(...values);
        });

        return keys;
    }

    private static getPageTitleCacheKeysByParameters({ spreadsheetMetadata = [], filters: topLevelFilters = [] }: GoogleSheetsGetPageTitlesBatchParametersV1): GetPageTitleCacheKeysByParametersResponse
    {
        const results = spreadsheetMetadata.reduce<GetPageTitleCacheKeysByParametersResponse>((
            acc,
            { spreadsheetId, filters = [] },
        ) =>
        {
            if (spreadsheetId)
            {
                const keys = this.getPageTitleCacheKeys({
                    spreadsheetId,
                    topLevelFilters,
                    currentFilters: filters,
                });

                acc.spreadsheetIdToKeysMap[spreadsheetId] = keys;
            }

            else
            {
                acc.allMetadataIsCacheable = false;
            }

            return acc;
        }, { spreadsheetIdToKeysMap: {}, allMetadataIsCacheable: true });

        return results;
    }

    public static async getRange(initialParameters: GoogleSheetsGetRangeParametersV1 & WithCacheOptions): Promise<GetRangeResponse>
    {
        const {
            shouldNotCache = false,
            ...parameters
        } = initialParameters;

        const cacheSpreadsheetKey = parameters?.spreadsheetId as string;
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
                    });
                    return {
                        errorType: GoogleSheetsApiErrorType.UserNotAddedToSheet,
                    };
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                logger.error('An error occurred on GoogleSheetsMicroservice.v1.getRange', (error as any)?.response?.data || error);
            }
        }

        return {
            errorType: GoogleSheetsApiErrorType.UnknownError,
        };
    }

    public static async getRanges(initialParameters: GetRangesOptions): Promise<GoogleSheetsGetRangesResponse>
    {
        const {
            shouldNotCache = false, // Add caching so this does something later
            secondsBetweenRetries = 0.5,
            numOfRetries = this.retries,
            ...parameters
        } = initialParameters;

        for (let i = 0; i <= numOfRetries; i += 1)
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
                seconds: secondsBetweenRetries,
            });
        }

        return {
            errorType: GoogleSheetsApiErrorType.UnknownError,
        };
    }

    public static async getPageTitlesBatch(initialParameters: GoogleSheetsGetPageTitlesBatchParametersV1 & WithCacheOptions): Promise<GoogleSheetsGetPageTitlesBatchResponse>
    {
        const {
            shouldNotCache = false, // Add caching so this does something later
            ...parameters
        } = initialParameters;

        const { spreadsheetIdToKeysMap, allMetadataIsCacheable } = this.getPageTitleCacheKeysByParameters(parameters);

        if (allMetadataIsCacheable)
        {
            const {
                allCachedDataWasFound,
                ...response
            } = Object.entries(spreadsheetIdToKeysMap).reduce<GoogleSheetsGetPageTitlesBatchResponse & {
                allCachedDataWasFound: boolean;
            }>((acc, [
                spreadsheetId,
                keys,
            ]) =>
            {
                const cachedTitles = this.pageTitleCache.Get(keys);

                if (cachedTitles === undefined)
                {
                    acc.allCachedDataWasFound = false;
                    return acc;
                }

                acc.spreadsheets?.push({ spreadsheetId, titles: cachedTitles });
                return acc;
            }, { spreadsheets: [], allCachedDataWasFound: true });

            if (allCachedDataWasFound)
            {
                return response;
            }
        }

        for (let i = 0; i <= this.retries; i += 1)
        {
            const authToken = await CachedAuthTokenService.getAuthToken();

            try
            {
                const {
                    statusCode = 200,
                    data,
                    error,
                } = await GoogleSheetsMicroservice.v1.getPageTitlesBatch(authToken, parameters);

                if (statusCode === 200)
                {
                    const { spreadsheets = [] } = data;

                    // Save to cache by spreadsheet / spreadsheetId
                    if (!shouldNotCache)
                    {
                        const { spreadsheetMetadata = [], filters: topLevelFilters = [] } = parameters;

                        // Convert to a record for faster retrieval in loops
                        const spreadsheetIdToTitles = spreadsheets.reduce<Record<string, string[]>>((
                            acc,
                            { spreadsheetId, titles },
                        ) =>
                        {
                            acc[spreadsheetId] = titles;
                            return acc;
                        }, {});

                        // Cache data
                        spreadsheetMetadata.forEach(({ spreadsheetId, filters = [] }) =>
                        {
                            if (spreadsheetId && filters.length > 0)
                            {
                                const keys = this.getPageTitleCacheKeys({
                                    spreadsheetId,
                                    topLevelFilters,
                                    currentFilters: filters,
                                });

                                const titles = spreadsheetIdToTitles[spreadsheetId];

                                this.pageTitleCache.Upsert(keys, titles);
                            }
                        });
                    }

                    return { spreadsheets };
                }

                if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.getRanges. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                    // eslint-disable-next-line no-continue -- Allow in this case
                    continue;
                }

                // eslint-disable-next-line @typescript-eslint/no-throw-literal -- TODO: Fix this later
                throw error;
            }
            catch (error)
            {
                // Forbidden error (occurs when the robot user for google sheets isn't added or doesn't have perms on the sheet)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call -- Fix this later if necessary
                if ((error as any)?.response?.data?.statusCode === 403)
                {
                    logger.warn('The automated user is not added to the queried sheet. Please add them.', {
                        ...(parameters?.spreadsheetMetadata && {
                            ranges: parameters?.spreadsheetMetadata,
                        }),
                        ...(parameters?.filters && {
                            ranges: parameters?.filters,
                        }),
                    });
                    return {
                        errorType: GoogleSheetsApiErrorType.UserNotAddedToSheet,
                    };
                }

                if (
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call -- Fix this later if necessary
                    (error as any)?.response?.data?.statusCode === 400
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call -- Fix this later if necessary
                    && (error as any)?.response?.data?.error?.message?.includes('Unable to parse range')
                )
                {
                    return {
                        errorType: GoogleSheetsApiErrorType.UnableToParseRange,
                    };
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call -- Fix this later if necessary
                logger.error('An error occurred on GoogleSheetsMicroservice.v1.getPageTitlesBatch', (error as any)?.response?.data || error);
            }

            // Wait half a second between retries
            await Timer.wait({
                seconds: 0.5,
            });
        }

        return {
            errorType: GoogleSheetsApiErrorType.UnknownError,
        };
    }

    public static async update(initialParameters: GoogleSheetsUpdateParametersV1 & WithCacheOptions): Promise<UpdateResponse>
    {
        const {
            shouldNotCache = false,
            ...parameters
        } = initialParameters;

        const cacheSpreadsheetKey = parameters?.spreadsheetId as string;
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
                    });
                    return {
                        errorType: GoogleSheetsApiErrorType.UserNotAddedToSheet,
                    };
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
                logger.error('An error occurred on GoogleSheetsMicroservice.v1.update', (error as any)?.response?.data || error);
            }
        }

        return {
            errorType: GoogleSheetsApiErrorType.UnknownError,
        };
    }

    // TODO: Make ptu or ptu_admin command that calls this
    public static clearCache(keys?: [string, string]): void
    {
        this.cache.Clear(keys);
    }
}
