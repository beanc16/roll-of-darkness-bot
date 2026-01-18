import { FileStorageResourceType, FileStorageService } from '@beanc16/file-storage';
import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { isValidAudioUrl } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class VcUploadFileStrategy
{
    public static key: VcSubcommand.Upload = VcSubcommand.Upload;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);
        const file = interaction.options.getAttachment('file');
        const fileUrl = interaction.options.getString('file_url');

        const processedFileUrl = file?.url ?? fileUrl;

        if (!processedFileUrl)
        {
            await interaction.editReply('Invalid parameters were submitted. Include a file or file_url.');
            return true;
        }

        if (!await isValidAudioUrl(processedFileUrl))
        {
            const parameterName = (file) ? 'file' : 'file_url';
            const beOrLink = (file) ? 'be' : 'link to';
            await interaction.editReply(`Invalid parameters were submitted. \`${parameterName}\` must ${beOrLink} an audio file.`);
            return true;
        }

        const newFileUrl = await this.uploadFile({
            interaction,
            fileName,
            fileUrl: processedFileUrl,
        });

        if (!newFileUrl)
        {
            await interaction.editReply('Failed to upload the file.');
            return true;
        }

        await interaction.followUp({
            content: `Successfully uploaded \`${fileName}\`.`,
            ephemeral: true,
        });

        return true;
    }

    private static async uploadFile({
        interaction,
        fileName,
        fileUrl,
    }: {
        interaction: ChatInputCommandInteraction;
        fileName: string;
        fileUrl: string;
    }): Promise<string | undefined>
    {
        try
        {
            const { url: newUrl } = await FileStorageService.upload({
                appId: process.env.APP_ID as string,
                file: {
                    fileName,
                    url: fileUrl,
                },
                nestedFolders: `vc-commands/${interaction.user.id}`,
                resourceType: FileStorageResourceType.Audio,
            });

            return newUrl;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any)
        {
            logger.warn(
                'An unknown error occurred while uploading an audio file',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                err?.response?.data ?? err,
                {
                    fileUrl,
                },
            );
        }

        return undefined;
    }
}
