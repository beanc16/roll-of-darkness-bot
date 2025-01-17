import { logger } from '@beanc16/logger';

import { PtuSubcommandGroup } from '../options/index.js';
import { PtuLookupSubcommand } from '../options/lookup.js';
import { PtuStrategyExecutor } from '../strategies/index.js';
// import { CharacterSheetStrategy } from '../strategies/CharacterSheetStrategy.js';

export class PtuCacheInitializer
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

            // Pokemon lookup data is not cached, so don't initialize it
            const subcommandsToInitialize = Object.values(PtuLookupSubcommand)
                .filter(subcommand =>
                    subcommand !== PtuLookupSubcommand.Class
                    && subcommand !== PtuLookupSubcommand.Pokemon,
                );

            // Initialize cachable lookup subcommands
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow so that multi-response type callbacks are easily supported
            const promises = subcommandsToInitialize.map<Promise<any>>(async subcommand =>
                await PtuStrategyExecutor.getLookupData({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand,
                }),
            );

            // TODO: Uncomment this later when prepared for retrieving data for /ptu train
            // promises.push(CharacterSheetStrategy.getAllPokemonNamesAndNicknames());

            logger.debug('Initializing Ptu data to cache...');
            await Promise.allSettled(promises);

            this.isInitialized = true;
        }

        catch (err)
        {
            logger.error('Failed to initialize Ptu data to cache', err);
        }
    }
}
