import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { QueuePosition } from '../../../../services/Queue.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import {
    getQueue,
    getVoiceConnectionData,
    isValidFileName,
} from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { VcQueueData } from '../../types.js';
import { VcViewFilesStrategy } from '../VcViewFilesStrategy.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QueueAddStrategy
{
    public static key: VcQueueSubcommand.Add = VcQueueSubcommand.Add;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);
        const shouldLoop = interaction.options.getBoolean('should_loop') || false;
        const queuePosition = interaction.options.getString('queue_position') as QueuePosition || QueuePosition.Last;

        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot add to a queue.',
            });
            return true;
        }

        const { wasSuccess } = await this.addToQueue({
            channelId: voiceChannel.id,
            discordUserId: interaction.user.id,
            fileName,
            position: queuePosition,
            shouldLoop,
        });

        if (wasSuccess)
        {
            const queueFilesList = QueueViewStrategy.getQueueDataMessage(voiceChannel.id);
            await interaction.editReply({
                content: `Successfully added \`${fileName}\` to the queue. ${queueFilesList}`,
            });
        }
        else
        {
            const fileNamesList = await VcViewFilesStrategy.getFileNamesMessage(interaction);
            await interaction.followUp({
                content: `A file named \`${fileName}\` does not exist. ${fileNamesList}`,
                ephemeral: true,
            });
        }

        return true;
    }

    private static async addToQueue({
        channelId,
        discordUserId,
        fileName,
        position,
        shouldLoop,
    }: {
        channelId: string;
        discordUserId: string;
        position: QueuePosition;
    } & VcQueueData): Promise<{ wasSuccess: boolean }>
    {
        if (!(await isValidFileName({ discordUserId, fileName })))
        {
            return { wasSuccess: false };
        }

        const queue = getQueue(channelId);
        queue.enqueue({ fileName, shouldLoop }, position);
        return { wasSuccess: true };
    }
}
