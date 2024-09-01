import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import * as options from './options/index.js';
import { MediaInstagramSubcommand } from './options/subcommand-groups/media/instagram.js';
import { MediaStrategyExecutor } from './strategies/media/index.js';
import { MediaSubcommandGroup } from './options/subcommand-groups/index.js';

class Media extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(options.subcommandGroups.image)
            .addSubcommandGroup(options.subcommandGroups.instagram);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup(true) as MediaSubcommandGroup;
        const subcommand = interaction.options.getSubcommand(true) as MediaInstagramSubcommand;

        try {
            // Run subcommand
            const response = MediaStrategyExecutor.run({
                subcommandGroup,
                subcommand,
                interaction,
            });

            // Send response if the handler failed or was undefined
            if (!response)
            {
                await interaction.editReply('Subcommand Group or subcommand not yet implemented');
            }
        } catch (err) {
            logger.error('An error occurred while processing media', err, {
                subcommandGroup,
                subcommand,
            });
            await interaction.editReply('An unknown error occurred');
        }
    }

    get description()
    {
        return `Run media commands.`;
    }
}

export default new Media();
