import { ChatInputCommandInteraction } from 'discord.js';
import { PtuQuickReferenceSubcommand } from '../../../options/subcommand-groups/ptu/quickReference.js';
import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';

export class BaseQuickReferenceStrategy
{
    static async run(
        interaction: ChatInputCommandInteraction,
        subcommand: PtuQuickReferenceSubcommand,
    ): Promise<boolean>
    {
        // Convert the subcommand into a file name. IE: "damage_charts" becomes "Damage Charts".
        const fileName = subcommand
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        try {
            // Get the url of the quick reference image
            const {
                data: {
                    url: imageUrl,
                },
            } = await FileStorageMicroservice.v1.get({
                appId: process.env.APP_ID as string,
                fileName,
                nestedFolders: 'ptu-quick-reference',
            });

            // Send message
            await interaction.editReply({
                files: [imageUrl],
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
