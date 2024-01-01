import { Events } from 'discord.js';
import { logger } from '@beanc16/logger';
import FlavorTextService from '../services/FlavorTextService';

async function handler()
{
	const devStr = (process.env.STAGE && process.env.STAGE === "dev")
		? "-dev"
		: "";

	logger.info(`${process.env.APPLICATION_NAME}${devStr} has connected.`);

	try
	{
		// Initialize singletons
		const flavorTextService = new FlavorTextService();
		await flavorTextService.getCategories();
		logger.info(`Initialized ${process.env.APPLICATION_NAME}'s singletons.`);
	}
	catch (err)
	{
		logger.error(`Failed to initialize ${process.env.APPLICATION_NAME}'s singletons.`, err);
	}
}



export = {
    name: Events.ClientReady,
    handler,
};
