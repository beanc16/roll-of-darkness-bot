import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../../helpers.js';
import { VcQueueSubcommand } from '../../options/queue.js';
import { VcQueueData } from '../../types.js';

@staticImplements<ChatIteractionStrategy>()
export class QueueViewStrategy
{
    public static key: VcQueueSubcommand.View = VcQueueSubcommand.View;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot view a queue.',
            });
            return true;
        }

        const messageContent = this.getQueueDataMessage(voiceChannel.id);

        await interaction.editReply({
            content: messageContent,
        });

        return true;
    }

    private static getQueueData(channelId: string): VcQueueData[]
    {
        const queue = getQueue(channelId);
        return queue.elements;
    }

    public static getQueueDataMessage(channelId: string): string
    {
        const queue = getQueue(channelId);
        const queueData = this.getQueueData(channelId);

        if (queueData.length === 0)
        {
            return 'Queue is empty.';
        }

        const trackNamesList = queueData.reduce<string>((acc, { fileName, shouldLoop }, index) =>
        {
            const lineBreak = (index !== 0) ? '\n' : '';
            const loopingText = (shouldLoop) ? 'Looping' : 'Not Looping';
            return `${acc}${lineBreak}- ${fileName} (${loopingText})`;
        }, '');

        const queueLoopingText = (queue.settings.shouldLoop) ? 'Looping' : 'Not Looping';

        return `Queue (${queueLoopingText}):\n${Text.Code.multiLine(trackNamesList)}`;
    }
}
