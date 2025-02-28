import { logger } from '@beanc16/logger';
import {
    joinVoiceChannel,
    type VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import { ChatInputCommandInteraction, type VoiceBasedChannel } from 'discord.js';

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

        await this.connect(interaction, voiceChannel);

        return true;
    }

    public static async connect(
        interaction: ChatInputCommandInteraction,
        voiceChannel: VoiceBasedChannel,
        joinMessageSuffix = 'ready to play audio',
    ): Promise<VoiceConnection>
    {
        return await new Promise<VoiceConnection>((resolve) =>
        {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId!,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            // Log errors
            connection.on('error', (error) =>
            {
                logger.error(`Error connecting to voice channel with /vc ${this.key}`, error);
            });

            // Send message to show the command was received
            connection.on(VoiceConnectionStatus.Ready, async () =>
            {
                // TODO: Add guildId to a set/array of connected guilds. Every few minutes, check how long that connection has been active, and DC any with inactivity for longer than 5 minutes.
                const comma = (joinMessageSuffix.length > 0) ? ', ' : '';
                await interaction.editReply({
                    content: `Joined voice channel successfully${comma}${joinMessageSuffix}.`,
                });
                resolve(connection);
            });
        });
    }
}
