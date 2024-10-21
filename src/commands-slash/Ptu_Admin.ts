import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import { PtuAdminSubcommand, copy } from './Ptu/subcommand-groups/admin.js';

import { PtuAdminStrategyExecutor } from './Ptu/strategies/admin.js';

class Ptu_Admin extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommand(copy);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommand = interaction.options.getSubcommand(true) as PtuAdminSubcommand;

        // Run subcommand
        const response = await PtuAdminStrategyExecutor.run({
            interaction,
            subcommand,
        });

        // Send response if the handler failed or was undefined
        if (!response)
        {
            await interaction.editReply('Subcommand not yet implemented');
        }
    }

    get description()
    {
        return `Run PTU Admin commands.`;
    }
}

export default new Ptu_Admin();
