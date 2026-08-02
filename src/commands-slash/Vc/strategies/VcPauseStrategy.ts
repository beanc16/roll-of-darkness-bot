import { AudioPlayerStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getAudioPlayerData, getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VoiceConnectionTimeoutManager } from '../services/VoiceConnectionTimeoutManager/VoiceConnectionTimeoutManager.js';

@staticImplements<ChatIteractionStrategy>()
export class VcPauseStrategy
{
    public static key: VcSubcommand.Pause = VcSubcommand.Pause;

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
                content: 'You are not in a voice channel to pause audio in.',
            });
            return true;
        }

        if (!existingConnection)
        {
            await interaction.editReply({
                content: `I'm not in a voice channel, so I cannot pause audio.`,
            });
            return true;
        }

        if (!inSameVoiceChannelAsUser)
        {
            await interaction.editReply({
                content: `I'm not in your voice channel, so I cannot pause audio.`,
            });
            return true;
        }

        await this.pause(interaction);

        return true;
    }

    private static async pause(interaction: ChatInputCommandInteraction): Promise<void>
    {
        const audioPlayer = getAudioPlayerData();

        let success = false;
        if (audioPlayer.state.status === AudioPlayerStatus.Playing)
        {
            success = audioPlayer.pause();
        }
        else
        {
            await interaction.editReply({
                content: 'Audio is not playing, so I cannot pause audio.',
            });
            return;
        }

        if (success)
        {
            await interaction.editReply({
                content: 'Paused audio.',
            });
        }
        else
        {
            await interaction.editReply({
                content: 'Failed to pause audio.',
            });
        }

        VoiceConnectionTimeoutManager.upsert(interaction.guildId!);
    }
}
