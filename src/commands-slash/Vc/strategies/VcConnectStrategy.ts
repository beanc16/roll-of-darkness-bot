import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class VcConnectStrategy
{
    public static key: VcSubcommand.Connect = VcSubcommand.Connect;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { inSameVoiceChannelAsUser, voiceChannel } = getVoiceConnectionData(interaction);

        if (!voiceChannel)
        {
            await interaction.editReply({
                content: 'You are not in a voice channel.',
            });
            return true;
        }

        if (inSameVoiceChannelAsUser)
        {
            await interaction.editReply({
                content: `I'm already connected to your voice channel.`,
            });
            return true;
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId!,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Send message to show the command was received
        connection.on(VoiceConnectionStatus.Ready, async () =>
        {
            await interaction.editReply({
                content: 'Joined voice channel successfully, ready to play audio.',
            });
        });

        return true;
    }
}
