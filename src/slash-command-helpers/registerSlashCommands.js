const SlashCommandsContainer = require('./SlashCommandsContainer');

async function registerCommands()
{
    await SlashCommandsContainer.registerAllCommands({
        guildId: '654702141293854746',
    });
}

registerCommands();
