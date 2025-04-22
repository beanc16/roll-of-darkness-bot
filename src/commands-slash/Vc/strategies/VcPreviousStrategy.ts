import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class VcPreviousStrategy
{
    public static key: VcSubcommand.Previous = VcSubcommand.Previous;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel, so I cannot play the previous audio.',
            });
            return true;
        }

        this.previous(interaction.channelId);
        await interaction.editReply({
            // TODO: Update message later
            content: 'Successfully went to the previous audio in the queue.',
        });

        return true;
    }

    private static previous(channelId: string): void
    {
        // TODO: Call play later
        const queue = getQueue(channelId);
        queue.previous();
    }
}
