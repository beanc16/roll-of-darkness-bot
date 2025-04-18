import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { QueuePosition } from '../../../../services/Queue.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { VcQueueData } from '../../types.js';

@staticImplements<ChatIteractionStrategy>()
export class QueueAddStrategy
{
    public static key: VcQueueSubcommand.Add = VcQueueSubcommand.Add;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
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

        this.addToQueue(voiceChannel.id, { fileName, shouldLoop }, queuePosition);

        // Send message
        await interaction.editReply({
            content: `Successfully added \`${fileName}\` to the queue.`,
        });

        return true;
    }

    private static addToQueue(channelId: string, data: VcQueueData, position: QueuePosition): void
    {
        const queue = getQueue(channelId);
        queue.enqueue(data, position);
    }
}
