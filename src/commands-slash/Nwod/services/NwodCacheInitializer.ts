import { logger } from '@beanc16/logger';

import { NwodSubcommandGroup } from '../options/index.js';
import { NwodLookupSubcommand } from '../options/lookup.js';
import { NwodStrategyExecutor } from '../strategies/index.js';

export class NwodCacheInitializer
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

            const subcommandsToInitialize = Object.values(NwodLookupSubcommand);

            // Initialize cachable lookup subcommands
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow so that multi-response type callbacks are easily supported
            const promises = subcommandsToInitialize.map<Promise<any>>(async subcommand =>
                await NwodStrategyExecutor.getLookupData({
                    subcommandGroup: NwodSubcommandGroup.Lookup,
                    subcommand,
                    options: { includeAllIfNoName: true },
                }),
            );

            logger.debug('Initializing nWOD data to cache...');
            await Promise.allSettled(promises);

            this.isInitialized = true;
        }

        catch (err)
        {
            logger.error('Failed to initialize nWOD data to cache', err);
        }
    }
}
