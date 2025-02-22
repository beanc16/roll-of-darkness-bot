import { logger } from '@beanc16/logger';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction, VoiceBasedChannel } from 'discord.js';

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

        this.connect(interaction, voiceChannel);

        return true;
    }

    private static connect(
        interaction: ChatInputCommandInteraction,
        voiceChannel: VoiceBasedChannel,
    ): void
    {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId!,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Send message to show the command was received
        connection.on(VoiceConnectionStatus.Ready, async () =>
        {
            // TODO: Add guildId to a set/array of connected guilds. Every few minutes, check how long that connection has been active, and DC any with inactivity for longer than 5 minutes.
            await interaction.editReply({
                content: 'Joined voice channel successfully, ready to play audio.',
            });
        });

        // Log errors
        connection.on('error', (error) =>
        {
            logger.error(`Error connecting to voice channel with /vc ${VcSubcommand.Connect}`, error);
        });
    }
}
