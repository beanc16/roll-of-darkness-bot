import { SlashCommandsContainer } from './registerSlashCommands/SlashCommandsContainer.js';

async function registerCommands(): Promise<void>
{
    // Register commands
    await SlashCommandsContainer.registerAllCommands({
        guildId: '654702141293854746',
    });

    // The script will get hung up for awhile or never finish unless this is called
    process.exit();
}

registerCommands();
