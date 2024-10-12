import { logger } from '@beanc16/logger';
import { FileStorageMicroservice, FileStorageMicroserviceImageOptionsV1 } from '@beanc16/microservices-abstraction';
import { randomUUID } from 'crypto';
import { ChatInputCommandInteraction } from 'discord.js';

// TODO: Add cleanup script later. Probably a GHA.

export class BaseImageStrategy
{
    static async run(interaction: ChatInputCommandInteraction, imageOptions: FileStorageMicroserviceImageOptionsV1): Promise<boolean>
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

        try {
            // Upload the image with the corresponding effects
            const {
                data: {
                    url: newUrl,
                },
            } = await FileStorageMicroservice.v1.upload({
                app: {
                    id: process.env.APP_ID as string,
                },
                file: {
                    fileName: fileName ?? randomUUID(),
                    url: processedImageUrl,
                },
                nestedFolders: 'image-commands',
                imageOptions,
            });

            // Send the new image
            await interaction.editReply({
                files: [{
                    attachment: newUrl,
                }],
            });

            return true;
        } catch (err: any) {
            logger.warn('An unknown error occurred while upscaling an image', err?.response?.data ?? err, {
                imageUrl: processedImageUrl,
            });

            await interaction.editReply('An unknown error occurred');
        }

        return false;
    }
}
