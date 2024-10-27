import { Client, Events } from 'discord.js';
import { logger } from '@beanc16/logger';
// import FlavorTextService from '../services/FlavorTextService.js';
import { CachedAuthTokenService } from '../services/CachedAuthTokenService.js';
import { SlashCommandsContainer } from '../slash-command-helpers/SlashCommandsContainer.js';

async function handler(bot: Client)
{
    const devStr = (process.env.STAGE && process.env.STAGE === "dev")
        ? "-dev"
        : "";

    logger.info(`${process.env.APPLICATION_NAME}${devStr} has connected.`);

    try
    {
        // Initialize flavor text singleton
        // const flavorTextService = new FlavorTextService();
        // await flavorTextService.getCategories();
        
        // Initialize auth token
        await CachedAuthTokenService.resetAuthToken();

        // Run startup functions
        const startupCommands = await SlashCommandsContainer.getAllStartupCommandsData();
        const startupPromisesToRun = startupCommands.map((command) =>
            command.runOnStartup(bot)
        );
        await Promise.all(startupPromisesToRun);

        // Log success
        logger.info(`Initialized ${process.env.APPLICATION_NAME}.`);
    }
    catch (error)
    {
        logger.error(`Failed to initialize ${process.env.APPLICATION_NAME}.`, (error as any)?.response?.data || error);
    }
}



export default {
    name: Events.ClientReady,
    handler,
};
