import { Text } from '@beanc16/discordjs-helpers';
import {
    FileStorageMicroservice,
    FileStorageMicroserviceGetFilesResponseV1,
    FileStorageMicroserviceResourceType,
} from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getVcCommandNestedFolderName } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class VcViewFilesStrategy
{
    public static key: VcSubcommand.ViewFiles = VcSubcommand.ViewFiles;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const messageContent = await this.getFileNamesMessage(interaction);

        await interaction.editReply({
            content: messageContent,
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

    public static async getFileNamesMessage(interaction: ChatInputCommandInteraction): Promise<string>
    {
        const files = await this.getUserFiles(interaction);

        if (files.length === 0)
        {
            return 'You have no uploaded files.';
        }

        const fileNamesList = files.reduce<string>((acc, { fileName }, index) =>
        {
            const lineBreak = (index !== 0) ? '\n' : '';
            return `${acc}${lineBreak}- ${fileName}`;
        }, '');

        return `File Names:\n${Text.Code.multiLine(fileNamesList)}`;
    }
}
