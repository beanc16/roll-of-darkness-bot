import { logger } from '@beanc16/logger';

import { LookupAbilityStrategy } from '../strategies/lookup/LookupAbilityStrategy.js';
import { LookupMoveStrategy } from '../strategies/lookup/LookupMoveStrategy.js';

export class PtuCacheInitializer
{
    private static lookupStrategiesToInitialize = [
        LookupMoveStrategy,
        LookupAbilityStrategy,
    ];

    public static async initialize(): Promise<void>
    {
        try
        {
            const promises = this.lookupStrategiesToInitialize.map(async (strategy) =>
                await strategy.getLookupData()
            );

            logger.debug('Initializing Ptu data to cache...');
            await Promise.allSettled(promises);
        }

        catch (err)
        {
            logger.error('Failed to initialize Ptu data to cache', err);
        }
    }
}
