import { logger } from '@beanc16/logger';
import { AudioPlayerStatus, type VoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import {
    getAudioPlayerData,
    getAudioResource,
    getVoiceConnectionData,
} from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VcConnectStrategy } from './VcConnectStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class VcPlayStrategy
{
    public static key: VcSubcommand.Play = VcSubcommand.Play;

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
                content: 'You are not in a voice channel, so I cannot play audio.',
            });
            return true;
        }

        let newConnection: VoiceConnection | undefined;
        if (!(existingConnection && inSameVoiceChannelAsUser))
        {
            newConnection = await VcConnectStrategy.connect(interaction, voiceChannel, 'playing audio');
        }
        else
        {
            await interaction.editReply({
                content: `Playing audio.`,
            });
        }

        await this.play(interaction, newConnection ?? existingConnection as VoiceConnection);

        return true;
    }

    private static async play(
        interaction: ChatInputCommandInteraction,
        connection: VoiceConnection,
    ): Promise<void>
    {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<void>(async (resolve) =>
        {
            const audioPlayer = getAudioPlayerData();
            const audioResource = await getAudioResource({ discordUserId: interaction.user.id });

            // Log errors
            audioPlayer.on('error', (error) =>
            {
                logger.error(`Error playing audio in a voice channel with /vc ${this.key}`, error);
            });

            // Send message to show the command was received
            audioPlayer.on(AudioPlayerStatus.Playing, () => resolve());

            // Play audio
            audioPlayer.play(audioResource);

            // Subscribe the connection to the audio player (will play audio on the voice connection)
            const subscription = connection.subscribe(audioPlayer);

            if (subscription) // could be undefined if the connection is destroyed
            {
                // When the audio player is idle, unsubscribe from the voice connection
                audioPlayer.on(AudioPlayerStatus.Idle, () => subscription.unsubscribe());
            }
        });
    }
}
