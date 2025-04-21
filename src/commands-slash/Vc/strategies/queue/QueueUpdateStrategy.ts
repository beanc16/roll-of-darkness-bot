import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { QueuePosition } from '../../../../services/Queue.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { VcQueueData } from '../../types.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QueueUpdateStrategy
{
    public static key: VcQueueSubcommand.Update = VcQueueSubcommand.Update;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);
        const shouldLoop = interaction.options.getBoolean('should_loop');
        const queuePosition = interaction.options.getString('queue_position') as QueuePosition | null;

        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot update audio in a queue.',
            });
            return true;
        }

        const { wasSuccess } = this.updateDataInQueue({
            channelId: voiceChannel.id,
            fileName,
            position: queuePosition,
            shouldLoop,
        });

        const queueFilesList = QueueViewStrategy.getQueueDataMessage(voiceChannel.id);
        if (wasSuccess)
        {
            await interaction.editReply({
                content: `Successfully updated \`${fileName}\` in the queue. ${queueFilesList}`,
            });
        }
        else
        {
            await interaction.followUp({
                content: `A file named \`${fileName}\` was not found in the queue. ${queueFilesList}`,
                ephemeral: true,
            });
        }

        return true;
    }

    private static updateDataInQueue({
        channelId,
        fileName,
        position,
        shouldLoop,
    }: {
        channelId: string;
        position: QueuePosition | null;
        shouldLoop: VcQueueData['shouldLoop'] | null;
    } & Pick<VcQueueData, 'fileName'>): { wasSuccess: boolean }
    {
        const queue = getQueue(channelId);
        const fileData = queue.find((item) => item.fileName === fileName);

        if (!fileData)
        {
            return { wasSuccess: false };
        }

        const wasSuccess = queue.update(fileData.index, {
            ...fileData.element,
            ...(shouldLoop !== null ? { shouldLoop } : {}),
        }, position);

        return { wasSuccess };
    }
}
