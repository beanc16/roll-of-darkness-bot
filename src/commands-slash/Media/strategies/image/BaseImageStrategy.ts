import { FileStorageOptions, FileStorageService } from '@beanc16/file-storage';
import { logger } from '@beanc16/logger';
import { randomUUID } from 'crypto';
import { ChatInputCommandInteraction } from 'discord.js';

import type { CommandName } from '../../../../types/discord.js';
import { PaginationStrategy } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';

export class BaseImageStrategy
{
    public static async run(interaction: ChatInputCommandInteraction, commandName: CommandName, imageOptions: FileStorageOptions): Promise<boolean>
    {
        const image = interaction.options.getAttachment('image');
        const imageUrl = interaction.options.getString('image_url');
        const fileName = interaction.options.getString('file_name');

        const processedImageUrl = image?.url ?? imageUrl;

        if (!processedImageUrl)
        {
            await interaction.editReply('Invalid parameters were submitted. Include an image or image_url.');
            return false;
        }

        try
        {
            // Upload the image with the corresponding effects
            const { url: newUrl } = await FileStorageService.upload({
                appId: process.env.APP_ID as string,
                file: {
                    fileName: fileName ?? randomUUID(),
                    url: processedImageUrl,
                },
                nestedFolders: 'image-commands',
                options: imageOptions,
            });

            // Send the new image
            await PaginationStrategy.run({
                originalInteraction: interaction,
                commandName,
                files: [{
                    attachment: newUrl,
                }],
                includeDeleteButton: true,
            });

            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Fix this later if necessary
        catch (err: any)
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- Fix this later if necessary
            logger.warn('An unknown error occurred while running an image command', err?.response?.data ?? err, {
                imageUrl: processedImageUrl,
            });

            await interaction.editReply('An unknown error occurred');
        }

        return false;
    }
}
