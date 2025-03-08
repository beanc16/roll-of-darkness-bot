import { logger } from '@beanc16/logger';
import {
    joinVoiceChannel,
    type VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import {
    type ChatInputCommandInteraction,
    PermissionFlagsBits,
    type VoiceBasedChannel,
} from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VoiceConnectionTimeoutManager } from '../services/VoiceConnectionTimeoutManager.js';

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
    ): Promise<VoiceConnection | undefined>
    {
        return await new Promise<VoiceConnection | undefined>(async (resolve) =>
        {
            const botPermissions = voiceChannel.permissionsFor(interaction.client.user);
            const requiredPermissions = [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak];

            // Check if the bot has the required permissions to connect
            if (!botPermissions || !requiredPermissions.every((permission) => botPermissions.has(permission)))
            {
                await interaction.editReply({
                    content: `I don't have the required permissions to connect to or speak in your voice channel.`,
                });
                resolve(undefined);
                return;
            }

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
                const comma = (joinMessageSuffix.length > 0) ? ', ' : '';
                await interaction.editReply({
                    content: `Joined voice channel successfully${comma}${joinMessageSuffix}.`,
                });
                VoiceConnectionTimeoutManager.upsert(interaction.guildId!);
                resolve(connection);
            });
        });
    }
}
