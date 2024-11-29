import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import { AdminSubcommand, refreshCache } from './Admin/options/index.js';
import { AdminStrategyExecutor } from './Admin/strategies/index.js';

class Admin extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommand(refreshCache);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Get parameter results
        const subcommand = interaction.options.getSubcommand() as AdminSubcommand;

        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Run subcommand
        const response = await AdminStrategyExecutor.run({
            interaction,
            subcommand,
        });

        // Send response if the handler failed or was undefined
        if (!response)
        {
            await interaction.editReply('Subcommand Group or subcommand not yet implemented');
        }
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return 'Run admin commands.';
    }
}

export default new Admin();
