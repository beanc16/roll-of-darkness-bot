const { logger } = require("@beanc16/logger");
const SlashCommandsContainer = require('./SlashCommandsContainer');
const FlavorTextService = require('../services/FlavorTextService');

async function registerCommands()
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
