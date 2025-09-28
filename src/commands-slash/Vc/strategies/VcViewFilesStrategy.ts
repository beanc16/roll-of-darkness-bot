import {
    FileStorageMicroservice,
    FileStorageMicroserviceGetFilesResponseV1,
    FileStorageMicroserviceResourceType,
} from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { getPagedEmbedMessages } from '../../embed-messages/shared.js';
import { PaginationStrategy } from '../../strategies/PaginationStrategy/PaginationStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getVcCommandNestedFolderName } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class VcViewFilesStrategy
{
    public static key: VcSubcommand.ViewFiles = VcSubcommand.ViewFiles;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const embeds = await this.getFileNamesEmbeds(interaction);

        // Send messages with pagination (fire and forget)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: `/vc view_files`,
            embeds,
        });

        return true;
    }

    private static async getUserFiles(interaction: ChatInputCommandInteraction): Promise<FileStorageMicroserviceGetFilesResponseV1['data']['files']>
    {
        const {
            data: {
                files,
            },
        } = await FileStorageMicroservice.v1.getFiles({
            appId: process.env.APP_ID as string,
            nestedFolders: getVcCommandNestedFolderName(interaction.user.id),
            resourceType: FileStorageMicroserviceResourceType.Audio,
        });

        return files;
    }

    public static async getFileNamesEmbeds(interaction: ChatInputCommandInteraction): Promise<EmbedBuilder[]>
    {
        const files = await this.getUserFiles(interaction);

        return getPagedEmbedMessages<typeof files[number]>({
            title: 'File Names',
            input: files,
            parseElementToLines: element => [
                `- ${element.fileName}`,
            ],
        });
    }
}
