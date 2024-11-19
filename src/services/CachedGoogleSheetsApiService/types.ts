import type { GoogleSheetsGetRangesResponseV1 } from '@beanc16/microservices-abstraction';

export enum GoogleSheetsApiErrorType {
    UserNotAddedToSheet = 'AUTOMATED_USER_NOT_ADDED_TO_SHEET',
    UnableToParseRange = 'UNABLE_TO_PARSE_RANGE',
    UnknownError = 'UNKNOWN_ERROR',
}

export interface GoogleSheetsGetRangesResponse
{
    data?: GoogleSheetsGetRangesResponseV1['data'];
    errorType?: GoogleSheetsApiErrorType;
}
