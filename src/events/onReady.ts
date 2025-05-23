import { logger } from '@beanc16/logger';
import { Client, Events } from 'discord.js';

import { HomebrewPokeApi } from '../commands-slash/Ptu/services/HomebrewPokeApi.js';
import { SlashCommandsContainer } from '../scripts/registerSlashCommands/SlashCommandsContainer.js';
import { CachedAuthTokenService } from '../services/CachedAuthTokenService.js';
import { LookupCacheInitializer } from '../services/LookupCacheInitializer.js';

async function handler(bot: Client): Promise<void>
{
    const devStr = (process.env.STAGE && process.env.STAGE === 'dev')
        ? '-dev'
        : '';

    logger.info(`${process.env.APPLICATION_NAME}${devStr} has connected.`);

    try
    {
        // Initialize auth token
        await CachedAuthTokenService.resetAuthToken();

        // Initialize nWOD and PTU caches
        await Promise.all([
            LookupCacheInitializer.initialize(),
            HomebrewPokeApi.initialize(),
        ]);

        // Run startup functions
        const startupCommands = await SlashCommandsContainer.getAllStartupCommandsData();
        const startupPromisesToRun = startupCommands.map(command =>
            command.runOnStartup(bot),
        );
        await Promise.all(startupPromisesToRun);

        // Log success
        logger.info(`Initialized ${process.env.APPLICATION_NAME}.`);
    }
    catch (error)
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
        logger.error(`Failed to initialize ${process.env.APPLICATION_NAME}.`, (error as any)?.response?.data || error);
    }
}

export default {
    name: Events.ClientReady,
    handler,
};
