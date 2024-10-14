import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import { CursebourneSubcommand, roll } from './Cursebourne/subcommand-groups/index.js';

import { CursebourneStrategyExecutor } from './Cursebourne/strategies/index.js';

class Cursebourne extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommand(roll);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Get parameter results
        const isSecret = interaction.options.getBoolean('secret') ?? false;
        const subcommand = interaction.options.getSubcommand(true) as CursebourneSubcommand;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Run subcommand
        const response = await CursebourneStrategyExecutor.run({
            interaction,
            subcommand,
        });

        // Send response if the handler failed or was undefined
        if (!response)
        {
            await interaction.editReply('Subcommand Group or subcommand not yet implemented');
        }
    }

    get commandName()
    {
        return 'cb';
    }

    get description()
    {
        return `Run Cursebourne commands.`;
    }
}

export default new Cursebourne();
