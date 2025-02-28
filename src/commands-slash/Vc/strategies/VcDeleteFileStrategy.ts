import { logger } from '@beanc16/logger';
import { FileStorageMicroservice, FileStorageMicroserviceResourceType } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand } from '../options/index.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class VcDeleteFileStrategy
{
    public static key: VcSubcommand.DeleteFile = VcSubcommand.DeleteFile;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);

        const success = await this.deleteFile(interaction, fileName);

        if (success)
        {
            await interaction.editReply({
                content: `Deleted file: \`${fileName}\``,
            });
        }
        else
        {
            const fileNames = await VcViewFilesStrategy.getFileNamesMessage(interaction);
            await interaction.editReply({
                content: `Failed to delete file: \`${fileName}\`. ${fileNames}`,
            });
        }

        return true;
    }

    private static async deleteFile(
        interaction: ChatInputCommandInteraction,
        fileName: string,
    ): Promise<boolean>
    {
        try
        {
            await FileStorageMicroservice.v1.delete({
                app: {
                    id: process.env.APP_ID as string,
                },
                fileName,
                nestedFolders: `vc-commands/${interaction.user.id}`,
                resourceType: FileStorageMicroserviceResourceType.Audio,
            });
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
