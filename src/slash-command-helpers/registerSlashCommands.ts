const { logger } = require("@beanc16/logger");
const SlashCommandsContainer = require('./SlashCommandsContainer');
const FlavorTextService = require('../services/FlavorTextService');

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
}

registerCommands();