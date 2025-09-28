import { logger } from '@beanc16/logger';
import { AudioPlayerStatus, type VoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { PaginationStrategy } from '../../strategies/PaginationStrategy/PaginationStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import {
    getAudioPlayerData,
    getAudioResource,
    getVoiceConnectionData,
} from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VoiceConnectionTimeoutManager } from '../services/VoiceConnectionTimeoutManager.js';
import { VcConnectStrategy } from './VcConnectStrategy.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class VcPlayStrategy
{
    public static key: VcSubcommand.Play = VcSubcommand.Play;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);
        const shouldLoop = interaction.options.getBoolean('should_loop');

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
            newConnection = await VcConnectStrategy.connect(interaction, voiceChannel, '');

            // If the bot can't connect to the voice channel, it can't play audio
            if (newConnection === undefined)
            {
                return true;
            }
        }

        await interaction.followUp({
            content: `Loading audio...`,
            ephemeral: true,
        });

        await this.play({
            interaction,
            connection: newConnection ?? existingConnection as VoiceConnection,
            fileName,
            shouldLoop,
        });

        return true;
    }

    private static async play({
        interaction,
        connection,
        fileName,
        shouldLoop,
    }: {
        interaction: ChatInputCommandInteraction;
        connection: VoiceConnection;
        fileName: string;
        shouldLoop: boolean | null;
    }): Promise<void>
    {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<void>(async (resolve) =>
        {
            const audioPlayer = getAudioPlayerData();
            const audioResource = await getAudioResource({
                discordUserId: interaction.user.id,
                fileName,
                shouldLoop: shouldLoop ?? false,
            });

            if (!audioResource)
            {
                const fileNamesEmbeds = await VcViewFilesStrategy.getFileNamesEmbeds(interaction);
                // Send messages with pagination (fire and forget)
                // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
                PaginationStrategy.run({
                    originalInteraction: interaction,
                    commandName: `/vc play`,
                    content: `A file named \`${fileName}\` does not exist.`,
                    embeds: fileNamesEmbeds,
                    interactionType: 'followUp',
                    ephemeral: true,
                });
                return;
            }

            // Log errors
            audioPlayer.on('error', (error) =>
            {
                logger.error(`Error playing audio in a voice channel with /vc ${this.key}`, error);
            });

            // Send message to show the command was received
            audioPlayer.once(AudioPlayerStatus.Playing, async () =>
            {
                await interaction.followUp({
                    content: `Playing audio.`,
                    ephemeral: true,
                });
                VoiceConnectionTimeoutManager.upsert(interaction.guildId!);
                resolve();
            });

            // Play audio
            audioPlayer.play(audioResource);

            // Subscribe the connection to the audio player (will play audio on the voice connection)
            const subscription = connection.subscribe(audioPlayer);

            if (subscription) // could be undefined if the connection is destroyed
            {
                // When the audio player is idle, unsubscribe from the voice connection
                audioPlayer.on(AudioPlayerStatus.Idle, () =>
                {
                    subscription.unsubscribe();
                });
            }
        });
    }
}
