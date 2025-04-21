import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { VcQueueData } from '../../types.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QueueRemoveStrategy
{
    public static key: VcQueueSubcommand.Remove = VcQueueSubcommand.Remove;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);

        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot remove from a queue.',
            });
            return true;
        }

        const { wasSuccess } = this.removeFromQueue({
            channelId: voiceChannel.id,
            fileName,
        });

        const queueFilesList = QueueViewStrategy.getQueueDataMessage(voiceChannel.id);
        if (wasSuccess)
        {
            await interaction.editReply({
                content: `Successfully removed \`${fileName}\` from the queue. ${queueFilesList}`,
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

    private static removeFromQueue({ channelId, fileName }: {
        channelId: string;
    } & Pick<VcQueueData, 'fileName'>): { wasSuccess: boolean }
    {
        const queue = getQueue(channelId);
        const removedElement = queue.remove((item) => item.fileName === fileName);
        return { wasSuccess: !!removedElement };
    }
}
