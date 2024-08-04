import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { AttachmentPayload, ChatInputCommandInteraction } from 'discord.js';

import * as options from './options';
import { MediaSubcommandGroup } from './options/subcommand-groups';
import { MediaInstagramSubcommand } from './options/subcommand-groups/media/instagram';
import { SubcommandHandlerFunction } from '../types/common';
import { InstagramMediaDownloader } from '../services/MediaDownloaders';

type SubcommandHandlers = {
    [MediaSubcommandGroup.Instagram]: {
        [key in MediaInstagramSubcommand]: SubcommandHandlerFunction
    };
}

class Media extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
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

        // Get handler
        const handler = this.subcommandHandlers[subcommandGroup][subcommand];

        // Run subcommand
        const response = (handler !== undefined)
            ? await handler(interaction)
            : false;

        // Send response if the handler failed or was undefined
        if (!response)
        {
            await interaction.editReply('Subcommand Group or subcommand not yet implemented');
        }
    }

    get description()
    {
        return `Run media commands.`;
    }

    private subcommandHandlers: SubcommandHandlers = {
        [MediaSubcommandGroup.Instagram]: {
            [MediaInstagramSubcommand.Download]: async (interaction: ChatInputCommandInteraction) =>
            {
                // Get parameter results as an array
                const inputUrls: string[] = [];

                for (let i = 1; i <= 10; i++)
                {
                    const curUrl = interaction.options.getString(`url_${i}`);

                    if (curUrl !== null)
                    {
                        inputUrls.push(curUrl);
                    }
                }

                // Get results
                const pagedDownloadUrls = await InstagramMediaDownloader.getPagedDownloadUrls(
                    inputUrls
                );

                // Parse to attachments array
                const pagedAttachments = pagedDownloadUrls.reduce<AttachmentPayload[][]>((acc, urls) => {
                    if (urls.length === 0)
                    {
                        return acc;
                    }

                    const attachments = urls.map<AttachmentPayload>((url) => {
                        return {
                            attachment: url,
                        };
                    });
                    acc.push(attachments);

                    return acc;
                }, []);

                // Early exit
                if (pagedAttachments.length === 0)
                {
                    await interaction.editReply('No images to download found.');
                }

                // TODO: Add pagination functionality later

                // Send result
                await interaction.editReply({
                    files: pagedAttachments[0],
                });

                // Reply to the original message with all files after the first
                for (const attachments of pagedAttachments.slice(1))
                {
                    await interaction.followUp({
                        files: attachments
                    });
                }

                return true;
            },
        },
    };
}

export default new Media();
