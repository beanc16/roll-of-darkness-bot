import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getQueue, getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VcConnectStrategy } from './VcConnectStrategy.js';
import { VcPlayStrategy } from './VcPlayStrategy.js';

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

        await this.previous(interaction);

        return true;
    }

    private static async previous(interaction: ChatInputCommandInteraction): Promise<void>
    {
        const connectionDataOrErrorMessage = await VcConnectStrategy.getNewOrExistingConnection(interaction);

        if ('errorMessage' in connectionDataOrErrorMessage)
        {
            await interaction.editReply({
                content: connectionDataOrErrorMessage.errorMessage,
            });
            return;
        }

        const { connection, voiceChannel } = connectionDataOrErrorMessage;

        const queue = getQueue(voiceChannel.id);
        if (queue.hasPrevious())
        {
            queue.previous();

            await VcPlayStrategy.play({
                interaction,
                connection,
                channelId: voiceChannel.id,
            });
        }
        else
        {
            await interaction.editReply({
                content: 'There is no previous audio in the queue to play.',
            });
        }
    }
}
