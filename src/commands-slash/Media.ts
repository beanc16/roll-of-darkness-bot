import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { MediaStrategyExecutor } from './Media/strategies/index.js';
import { MediaImageSubcommand } from './Media/subcommand-groups/image.js';
import {
    image,
    instagram,
    MediaSubcommandGroup,
} from './Media/subcommand-groups/index.js';
import { MediaInstagramSubcommand } from './Media/subcommand-groups/instagram.js';

class Media extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(image)
            .addSubcommandGroup(instagram);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup(true) as MediaSubcommandGroup;
        const subcommand = interaction.options.getSubcommand(true) as MediaImageSubcommand | MediaInstagramSubcommand;

        try
        {
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
        }
        catch (err)
        {
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
