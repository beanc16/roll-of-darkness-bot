import { logger } from '@beanc16/logger';
import { SlashCommandsContainer } from './SlashCommandsContainer.js';
import FlavorTextService from '../services/FlavorTextService.js';

async function registerCommands(): Promise<void>
{
    // Initialize singletons
    logger.info(`Initializing singletons.`);
    const flavorTextService = new FlavorTextService();
    await flavorTextService.getCategories();
    logger.info(`Initialized singletons.`);

    // Register commands
    await SlashCommandsContainer.registerAllCommands({
        guildId: '654702141293854746',
    });

    // The script will get hung up for awhile or never finish unless this is called
    process.exit();
}

registerCommands();
