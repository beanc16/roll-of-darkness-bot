import { AudioPlayerStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import {
    getAudioPlayerData,
    getQueue,
    getVoiceConnectionData,
} from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VoiceConnectionTimeoutManager } from '../services/VoiceConnectionTimeoutManager/VoiceConnectionTimeoutManager.js';

@staticImplements<ChatIteractionStrategy>()
export class VcStopStrategy
{
    public static key: VcSubcommand.Stop = VcSubcommand.Stop;

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
                content: 'You are not in a voice channel to stop playing audio in.',
            });
            return true;
        }

        if (!existingConnection)
        {
            await interaction.editReply({
                content: `I'm not in a voice channel, so I cannot stop playing audio.`,
            });
            return true;
        }

        if (!inSameVoiceChannelAsUser)
        {
            await interaction.editReply({
                content: `I'm not in your voice channel, so I cannot stop playing audio.`,
            });
            return true;
        }

        await this.stop(interaction, voiceChannel.id);

        return true;
    }

    public static async stop(interaction: ChatInputCommandInteraction, channelId: string): Promise<void>
    {
        return await new Promise<void>(async (resolve) =>
        {
            const queue = getQueue(channelId);
            const audioPlayer = getAudioPlayerData();

            if (
                audioPlayer.state.status === AudioPlayerStatus.Idle
                || audioPlayer.state.status === AudioPlayerStatus.Buffering
            )
            {
                await interaction.editReply({
                    content: 'Audio is not playing or paused, so I cannot stop audio.',
                });
                resolve();
            }
            else
            {
                // Send message to show the command was received
                audioPlayer.once(AudioPlayerStatus.Idle, async () =>
                {
                    await interaction.followUp({
                        content: 'Stopped playing audio.',
                        ephemeral: true,
                    });
                    VoiceConnectionTimeoutManager.upsert(interaction.guildId!);
                    resolve();
                });

                // Disable queue so no more audio is played and events don't skip to the end of the queue
                queue.setIsEnabled(false);

                // Stop audio
                audioPlayer.stop(true); // true stops even if the audio is paused, rather than playing
            }
        });
    }
}
