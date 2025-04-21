import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QueueClearStrategy
{
    public static key: VcQueueSubcommand.Clear = VcQueueSubcommand.Clear;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot clear the queue.',
            });
            return true;
        }

        this.clearQueue({ channelId: voiceChannel.id });

        const queueFilesList = QueueViewStrategy.getQueueDataMessage(voiceChannel.id);
        await interaction.editReply({
            content: `Successfully cleared the queue. ${queueFilesList}`,
        });

        return true;
    }

    private static clearQueue({ channelId }: {
        channelId: string;
    }): void
    {
        const queue = getQueue(channelId);
        queue.clear();
    }
}
