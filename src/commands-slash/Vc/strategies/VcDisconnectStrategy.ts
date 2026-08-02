import { type VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VoiceConnectionTimeoutManager } from '../services/VoiceConnectionTimeoutManager/VoiceConnectionTimeoutManager.js';
import { QueueClearStrategy } from './queue/QueueClearStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class VcDisconnectStrategy
{
    public static key: VcSubcommand.Disconnect = VcSubcommand.Disconnect;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const {
            existingConnection,
            inSameVoiceChannelAsUser,
            voiceChannel,
        } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel to disconnect from.',
            });
            return true;
        }

        if (!existingConnection)
        {
            await interaction.editReply({
                content: `I'm not in a voice channel, so I cannot disconnect.`,
            });
            return true;
        }

        if (!inSameVoiceChannelAsUser)
        {
            await interaction.editReply({
                content: `I'm not in your voice channel, so I cannot disconnect.`,
            });
            return true;
        }

        await this.disconnect(interaction, existingConnection, voiceChannel.id);

        return true;
    }

    private static async disconnect(
        interaction: ChatInputCommandInteraction,
        connection: VoiceConnection,
        channelId: string,
    ): Promise<void>
    {
        return await new Promise<void>((resolve) =>
        {
            // Send message to show the command was received
            connection.on(VoiceConnectionStatus.Destroyed, async () =>
            {
                QueueClearStrategy.clearQueue({ interaction, channelId });
                await interaction.editReply({
                    content: 'Disconnected from your voice channel successfully.',
                });
                VoiceConnectionTimeoutManager.delete(interaction.guildId!);
                resolve();
            });

            connection.destroy();
        });
    }
}
