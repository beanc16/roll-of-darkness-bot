const SlashCommandsContainer = require('./SlashCommandsContainer');

async function registerCommands()
{
    await SlashCommandsContainer.registerCommands();
}

registerCommands();
