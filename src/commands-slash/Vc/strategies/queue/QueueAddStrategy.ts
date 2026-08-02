import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { QueuePosition } from '../../../../services/Queue/Queue.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import {
    getQueue,
    getVoiceConnectionData,
    isValidFileName,
} from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { VcQueueData } from '../../types.js';
import { VcLoadStrategy } from '../VcLoadStrategy.js';
import { VcViewFilesStrategy } from '../VcViewFilesStrategy.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

export interface QueueAddGetParameterResults
{
    files: (VcQueueData & {
        queuePosition: QueuePosition;
    })[];
}

@staticImplements<ChatIteractionStrategy>()
export class QueueAddStrategy
{
    public static key: VcQueueSubcommand.Add = VcQueueSubcommand.Add;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { files } = this.getOptions(interaction);

        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot add to a queue.',
            });
            return true;
        }

        const {
            wasSuccess,
            successfulFileNames,
            failedFileNames,
        } = await this.addToQueue({
            interaction,
            channelId: voiceChannel.id,
            files,
        });

        const successfulFileNamesStr = successfulFileNames.length === 0
            ? ''
            : `\`${successfulFileNames.join('`, `')}\``;
        const failedFileNamesStr = failedFileNames.length === 0
            ? ''
            : `\`${failedFileNames.join('`, `')}\``;
        const failedFileNamesMessage = failedFileNamesStr.length > 0
            ? `File${failedFileNames.length > 1 ? 's' : ''} named ${failedFileNamesStr} do${failedFileNames.length > 1 ? '' : 'es'} not exist. `
            : '';

        if (wasSuccess)
        {
            const queueFilesList = QueueViewStrategy.getQueueDataMessage(voiceChannel.id);
            await interaction.editReply({
                content: `Successfully added ${successfulFileNamesStr} to the queue. ${failedFileNamesMessage}${queueFilesList}`,
            });
        }
        else
        {
            const fileNamesEmbeds = await VcViewFilesStrategy.getFileNamesEmbeds(interaction);
            await interaction.followUp({
                content: failedFileNamesMessage.trim(),
                embeds: fileNamesEmbeds,
                ephemeral: true,
            });
        }

        return true;
    }

    public static async addToQueue({
        interaction,
        channelId,
        files,
    }: {
        interaction: ChatInputCommandInteraction;
        channelId: string;
        files: QueueAddGetParameterResults['files'];
    }): Promise<{
        wasSuccess: boolean;
        successfulFileNames: string[];
        failedFileNames: string[];
    }>
    {
        const queue = getQueue(channelId);
        const response: {
            wasSuccess: boolean;
            successfulFileNames: string[];
            failedFileNames: string[];
        } = {
            wasSuccess: true,
            successfulFileNames: [],
            failedFileNames: [],
        };

        for (let index = 0; index < files.length; index += 1)
        {
            const { fileName, shouldLoop, queuePosition: position } = files[index];

            if (await isValidFileName({ discordUserId: interaction.user.id, fileName }))
            {
                response.successfulFileNames.push(fileName);
                queue.enqueue({ fileName, shouldLoop }, position);
            }
            else
            {
                response.failedFileNames.push(fileName);
            }
        }

        const fileNames = files.map(({ fileName }) => fileName);
        await VcLoadStrategy.load({
            interaction,
            fileNames,
        });

        return response;
    }

    private static getOptions(interaction: ChatInputCommandInteraction): QueueAddGetParameterResults
    {
        const files: QueueAddGetParameterResults['files'] = [];

        for (let index = 1; index <= 3; index += 1)
        {
            const fileName = interaction.options.getString(`file_name_${index}`);
            if (fileName)
            {
                files.push({
                    fileName,
                    shouldLoop: interaction.options.getBoolean(`should_loop_${index}`) || false,
                    queuePosition: interaction.options.getString(`queue_position_${index}`) as QueuePosition || QueuePosition.Last,
                });
            }
        }

        return { files };
    }
}
