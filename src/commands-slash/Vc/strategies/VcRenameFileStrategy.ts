import { logger } from '@beanc16/logger';
import { FileStorageMicroservice, FileStorageMicroserviceResourceType } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand } from '../options/index.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class VcRenameFileStrategy
{
    public static key: VcSubcommand.RenameFile = VcSubcommand.RenameFile;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const oldFileName = interaction.options.getString('old_file_name', true);
        const newFileName = interaction.options.getString('new_file_name', true);

        const success = await this.renameFile(interaction, oldFileName, newFileName);

        if (success)
        {
            await interaction.editReply({
                content: `Renamed file from \`${oldFileName}\` to \`${newFileName}\`.`,
            });
        }
        else
        {
            const fileNames = await VcViewFilesStrategy.getFileNamesMessage(interaction);
            await interaction.editReply({
                content: `Failed to rename file from \`${oldFileName}\` to \`${newFileName}\`. ${fileNames}`,
            });
        }

        return true;
    }

    private static async renameFile(
        interaction: ChatInputCommandInteraction,
        oldFileName: string,
        newFileName: string,
    ): Promise<boolean>
    {
        try
        {
            const nestedFolders = `vc-commands/${interaction.user.id}`;
            await FileStorageMicroservice.v1.rename({
                app: {
                    id: process.env.APP_ID as string,
                },
                old: {
                    fileName: oldFileName,
                    nestedFolders,
                },
                new: {
                    fileName: newFileName,
                    nestedFolders,
                },
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
            logger.warn('An unknown error occurred while renaming an audio file', err?.response?.data ?? err);
        }

        return false;
    }
}
