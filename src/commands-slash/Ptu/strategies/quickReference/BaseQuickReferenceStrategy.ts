import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { capitalizeFirstLetter } from '../../../../services/stringHelpers.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';

export class BaseQuickReferenceStrategy
{
    public static async run(
        interaction: ChatInputCommandInteraction,
        subcommand: PtuQuickReferenceInfo,
        numOfImages: number = 1,
    ): Promise<boolean>
    {
        if (numOfImages > 10)
        {
            throw new Error('Cannot have more than 10 images');
        }

        // Convert the subcommand into a file name. IE: "damage_charts" becomes "Damage Charts".
        const fileName = subcommand
            .split('_')
            .map(word => capitalizeFirstLetter(word))
            .join(' ');

        try
        {
            const promises = Array.from({ length: numOfImages }, (_, index) => FileStorageMicroservice.v1.get({
                appId: process.env.APP_ID as string,
                fileName: (numOfImages > 1)
                    ? `${fileName} ${index + 1}`
                    : fileName,
                nestedFolders: 'ptu-quick-reference',
            }));

            const responses = await Promise.all(promises);
            const imageUrls = responses.map(response => response.data.url);

            // Send message
            await interaction.editReply({
                files: imageUrls,
            });

            return true;
        }
        catch (error)
        {
            await interaction.editReply(`Failed to get ${fileName}`);
            return true;
        }
    }
}
