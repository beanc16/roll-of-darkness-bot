import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { PaginationStrategy } from '../../strategies/PaginationStrategy/PaginationStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { removeAudioBufferFromCache } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';
import { FileStorageResourceType, FileStorageService } from '@beanc16/file-storage';

@staticImplements<ChatIteractionStrategy>()
export class VcDeleteFileStrategy
{
    public static key: VcSubcommand.DeleteFile = VcSubcommand.DeleteFile;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);

        const success = await this.deleteFile(interaction, fileName);
        const fileNamesEmbeds = await VcViewFilesStrategy.getFileNamesEmbeds(interaction);

        const content = success
            ? `Deleted file: \`${fileName}\`.`
            : `Failed to delete file: \`${fileName}\`.`;

        // Send messages with pagination (fire and forget)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: `/vc delete_file`,
            content,
            embeds: fileNamesEmbeds,
        });

        return true;
    }

    private static async deleteFile(
        interaction: ChatInputCommandInteraction,
        fileName: string,
    ): Promise<boolean>
    {
        try
        {
            await FileStorageService.delete({
                appId: process.env.APP_ID as string,
                fileName,
                nestedFolders: `vc-commands/${interaction.user.id}`,
                resourceType: FileStorageResourceType.Audio,
            });
            removeAudioBufferFromCache(interaction.user.id, fileName);
            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any)
        {
            // The file does not exist
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if ((err?.response?.data?.error?.message || '') === 'Request failed with status code 404')
            {
                return false;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            logger.warn('An unknown error occurred while deleting an audio file', err?.response?.data ?? err);
        }

        return false;
    }
}
