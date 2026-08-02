import { AudioPlayerStatus } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getAudioPlayerData, getVoiceConnectionData } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VoiceConnectionTimeoutManager } from '../services/VoiceConnectionTimeoutManager/VoiceConnectionTimeoutManager.js';

@staticImplements<ChatIteractionStrategy>()
export class VcUnpauseStrategy
{
    public static key: VcSubcommand.Unpause = VcSubcommand.Unpause;

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
                content: 'You are not in a voice channel to unpause audio in.',
            });
            return true;
        }

        if (!existingConnection)
        {
            await interaction.editReply({
                content: `I'm not in a voice channel, so I cannot unpause audio.`,
            });
            return true;
        }

        if (!inSameVoiceChannelAsUser)
        {
            await interaction.editReply({
                content: `I'm not in your voice channel, so I cannot unpause audio.`,
            });
            return true;
        }

        await this.unpause(interaction);

        return true;
    }

    private static async unpause(interaction: ChatInputCommandInteraction): Promise<void>
    {
        const audioPlayer = getAudioPlayerData();

        let success = false;
        if (audioPlayer.state.status === AudioPlayerStatus.Paused || audioPlayer.state.status === AudioPlayerStatus.AutoPaused)
        {
            success = audioPlayer.unpause();
        }
        else
        {
            await interaction.editReply({
                content: 'Audio is not paused, so I cannot unpause audio.',
            });
            return;
        }

        if (success)
        {
            await interaction.editReply({
                content: 'Unpaused audio.',
            });
        }
        else
        {
            await interaction.editReply({
                content: 'Failed to unpause audio.',
            });
        }

        VoiceConnectionTimeoutManager.upsert(interaction.guildId!);
    }
}
