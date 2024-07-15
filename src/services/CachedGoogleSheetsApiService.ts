import {
    GoogleSheetsGetRangeParametersV1,
    GoogleSheetsGetRangesParametersV1,
    GoogleSheetsMicroservice,
} from '@beanc16/microservices-abstraction';
import { CachedAuthTokenService } from './CachedAuthTokenService';
import { logger } from '@beanc16/logger';
import { CompositeKeyRecord } from './CompositeKeyRecord';

interface GetRangeResponse
{
    data?: string[][];
    errorType?: 'AUTOMATED_USER_NOT_ADDED_TO_SHEET';
}

export class CachedGoogleSheetsApiService
{
    static #retries = 1;
    static #cache: CompositeKeyRecord<[string, string], string[][]> = new CompositeKeyRecord();

    static async getRange(parameters: GoogleSheetsGetRangeParametersV1): Promise<GetRangeResponse>
    {
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
                    this.#cache.Add([cacheSpreadsheetKey, cacheRangeKey], data);
                    return { data };
                }

                else if (statusCode === 401)
                {
                    logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.getRange. Retrieving new auth token.');
                    await CachedAuthTokenService.resetAuthToken();
                    continue;
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
                        errorType: 'AUTOMATED_USER_NOT_ADDED_TO_SHEET',
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

    static async getRanges(parameters: GoogleSheetsGetRangesParametersV1): Promise<void>
    {
        for (let i = 0; i <= this.#retries; i += 1)
        {
            const authToken = await CachedAuthTokenService.getAuthToken();
            const {
                statusCode = 200,
                data = [],
                error,
            } = await GoogleSheetsMicroservice.v1.getRanges(authToken, parameters);

            if (statusCode === 200)
            {
                // TODO: Parse data later
                console.log('\n data:', data);
                // return data;
            }

            else if (statusCode === 401)
            {
                logger.info('A 401 error occurred on GoogleSheetsMicroservice.v1.getRange. Retrieving new auth token.');
                await CachedAuthTokenService.resetAuthToken();
                continue;
            }

            throw error;
        }

        return undefined;
    }
}
