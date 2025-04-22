import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class VcNextStrategy
{
    public static key: VcSubcommand.Next = VcSubcommand.Next;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot play the next audio.',
            });
            return true;
        }

        this.next(interaction.channelId);
        await interaction.editReply({
            // TODO: Update message later
            content: 'Successfully went to the next audio in the queue.',
        });

        return true;
    }

    private static next(channelId: string): void
    {
        // TODO: Call play later
        const queue = getQueue(channelId);
        queue.next();
    }
}
