import { Events } from 'discord.js';
import { logger } from '@beanc16/logger';
import FlavorTextService from '../services/FlavorTextService';
import { CachedAuthTokenService } from '../services/CachedAuthTokenService';

async function handler()
{
    const devStr = (process.env.STAGE && process.env.STAGE === "dev")
        ? "-dev"
        : "";

    logger.info(`${process.env.APPLICATION_NAME}${devStr} has connected.`);

    try
    {
        // Initialize flavor text singleton
        const flavorTextService = new FlavorTextService();
        await flavorTextService.getCategories();
        
        // Initialize auth token
        await CachedAuthTokenService.resetAuthToken();

        // 
        logger.info(`Initialized ${process.env.APPLICATION_NAME}.`);
    }
    catch (err)
    {
        logger.error(`Failed to initialize ${process.env.APPLICATION_NAME}.`, err);
    }
}



export default {
    name: Events.ClientReady,
    handler,
};
