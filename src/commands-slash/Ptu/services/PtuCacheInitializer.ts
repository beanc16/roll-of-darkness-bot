import { logger } from '@beanc16/logger';

import { PtuStrategyExecutor } from '../strategies/index.js';
import { PtuSubcommandGroup } from '../subcommand-groups/index.js';
import { PtuLookupSubcommand } from '../subcommand-groups/lookup.js';
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
                .filter((subcommand) => subcommand !== PtuLookupSubcommand.Pokemon);

            // Initialize cachable lookup subcommands
            const promises = subcommandsToInitialize.map<Promise<any>>(async (subcommand) =>
                await PtuStrategyExecutor.getLookupData({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand,
                })
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
