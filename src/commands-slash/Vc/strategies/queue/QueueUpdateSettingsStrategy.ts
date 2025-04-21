import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { VcQueueData } from '../../types.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QueueUpdateSettingsStrategy
{
    public static key: VcQueueSubcommand.UpdateSettings = VcQueueSubcommand.UpdateSettings;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const shouldLoop = interaction.options.getBoolean('should_loop', true);

        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot set a queue to loop/not loop.',
            });
            return true;
        }

        this.updateQueueSettings({
            channelId: voiceChannel.id,
            shouldLoop,
        });

        const messageContent = QueueViewStrategy.getQueueDataMessage(voiceChannel.id);
        await interaction.editReply({
            content: messageContent,
        });

        return true;
    }

    private static updateQueueSettings({ channelId, shouldLoop }: {
        channelId: string;
    } & Pick<VcQueueData, 'shouldLoop'>): void
    {
        const queue = getQueue(channelId);
        queue.updateSettings({ shouldLoop });
    }
}
