import { FileStorageMicroservice, FileStorageMicroserviceResourceType } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class VcDeleteFileStrategy
{
    public static key: VcSubcommand.DeleteFile = VcSubcommand.DeleteFile;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);

        await this.deleteFile(interaction, fileName);

        await interaction.editReply({
            content: `Deleted file: \`${fileName}\``,
        });

        return true;
    }

    private static async deleteFile(interaction: ChatInputCommandInteraction, fileName: string): Promise<void>
    {
        await FileStorageMicroservice.v1.delete({
            app: {
                id: process.env.APP_ID as string,
            },
            fileName,
            nestedFolders: `vc-commands/${interaction.user.id}`,
            resourceType: FileStorageMicroserviceResourceType.Audio,
        });
    }
}
