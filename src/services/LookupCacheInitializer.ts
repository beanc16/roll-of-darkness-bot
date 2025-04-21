import { logger } from '@beanc16/logger';

import { rollOfDarknessNwodSpreadsheetId } from '../commands-slash/Nwod/constants.js';
import { NwodLookupRange } from '../commands-slash/Nwod/types/lookup.js';
import { rollOfDarknessPtuSpreadsheetId } from '../commands-slash/Ptu/constants.js';
import { PtuLookupRange } from '../commands-slash/Ptu/types/autocomplete.js';
import { CachedGoogleSheetsApiService, GetRangesOptions } from './CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';

export class LookupCacheInitializer
{
    private static isInitialized = false;

    public static async initialize(): Promise<void>
    {
        try
        {
            // Early exit if already initialized
            if (this.isInitialized)
            {
                return;
            }

            const ptuRanges = Object.values(PtuLookupRange).map<NonNullable<GetRangesOptions['ranges']>['0']>(value => ({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: value,
            }));

            const nwodRanges = Object.values(NwodLookupRange).map<NonNullable<GetRangesOptions['ranges']>['0']>(value => ({
                spreadsheetId: rollOfDarknessNwodSpreadsheetId,
                range: value,
            }));

            logger.debug('Initializing lookup data to cache...');
            await CachedGoogleSheetsApiService.getRanges({
                ranges: [...ptuRanges, ...nwodRanges],
            });

            this.isInitialized = true;
        }

        catch (err)
        {
            logger.error('Failed to initialize lookup data to cache', err);
        }
    }
}
