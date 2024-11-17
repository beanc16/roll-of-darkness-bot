import { AttachmentPayload, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { InstagramMediaDownloader } from '../../services/MediaDownloaders.js';
import { MediaInstagramSubcommand } from '../../subcommand-groups/instagram.js';

@staticImplements<ChatIteractionStrategy>()
export class InstagramDownloadStrategy
{
    public static key: MediaInstagramSubcommand.Download = MediaInstagramSubcommand.Download;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results as an array
        const inputUrls: string[] = [];

        for (let index = 1; index <= 10; index += 1)
        {
            const curUrl = interaction.options.getString(`url_${index}`);

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
        const pagedDownloadBuffers = await InstagramMediaDownloader.getPagedDownloadUrls(
            inputUrls,
        );

        // Parse to attachments array
        const pagedAttachments = pagedDownloadBuffers.reduce<AttachmentPayload[][]>((acc, buffers) =>
        {
            if (buffers.length === 0)
            {
                return acc;
            }

            const attachments = buffers.map<AttachmentPayload>((buffer) =>
            {
                return {
                    attachment: buffer,
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
        // eslint-disable-next-line no-restricted-syntax -- Allow this for sequential followup messages
        for (const attachments of pagedAttachments.slice(1))
        {
            // eslint-disable-next-line no-await-in-loop -- Send sequential await messages
            await interaction.followUp({
                files: attachments,
            });
        }

        return true;
    }
}
