import { AttachmentPayload, ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { InstagramMediaDownloader } from '../../services/MediaDownloaders.js';
import { MediaInstagramSubcommand } from '../../subcommand-groups/instagram.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';

@staticImplements<ChatIteractionStrategy>()
export class InstagramDownloadStrategy
{
    public static key = MediaInstagramSubcommand.Download;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results as an array
        const inputUrls: string[] = [];

        for (let i = 1; i <= 10; i++)
        {
            const curUrl = interaction.options.getString(`url_${i}`);

            if (curUrl !== null)
            {
                const indexOfUrlToRemove = curUrl.indexOf('/?');

                const inputUrl = (indexOfUrlToRemove >= 0)
                    ? curUrl.substring(0, indexOfUrlToRemove)
                    : curUrl;

                inputUrls.push(inputUrl);
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
    }
}
