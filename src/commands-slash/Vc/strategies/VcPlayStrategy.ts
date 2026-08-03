import { logger } from '@beanc16/logger';
import { AudioPlayerStatus, type VoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { QueuePosition } from '../../../services/Queue/Queue.js';
import { PaginationStrategy } from '../../strategies/PaginationStrategy/PaginationStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import {
    getAudioPlayerData,
    getAudioResource,
    getQueue,
} from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VoiceConnectionTimeoutManager } from '../services/VoiceConnectionTimeoutManager/VoiceConnectionTimeoutManager.js';
import { QueueAddStrategy } from './queue/QueueAddStrategy.js';
import { QueueViewStrategy } from './queue/QueueViewStrategy.js';
import { VcConnectStrategy } from './VcConnectStrategy.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class VcPlayStrategy
{
    public static key: VcSubcommand.Play = VcSubcommand.Play;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', false);
        const shouldLoop = interaction.options.getBoolean('should_loop');

        const connectionDataOrErrorMessage = await VcConnectStrategy.getNewOrExistingConnection(interaction);

        if ('errorMessage' in connectionDataOrErrorMessage)
        {
            await interaction.editReply({
                content: connectionDataOrErrorMessage.errorMessage,
            });
            return true;
        }

        const { connection, voiceChannel } = connectionDataOrErrorMessage;

        await interaction.followUp({
            content: `Loading audio...`,
            ephemeral: true,
        });

        // Add given file to the queue as next
        if (fileName)
        {
            const audioPlayer = getAudioPlayerData(voiceChannel.id);
            const shouldPlayNext = audioPlayer.state.status !== AudioPlayerStatus.Idle;
            await QueueAddStrategy.addToQueue({
                interaction,
                channelId: voiceChannel.id,
                files: [{
                    fileName,
                    queuePosition: shouldPlayNext
                        ? QueuePosition.Next      // Add as next if currently playing
                        : QueuePosition.Previous, // Add as previous if not currently playing
                    shouldLoop: shouldLoop ?? false,
                }],
            });

            // Go to next so it plays next
            if (shouldPlayNext)
            {
                const queue = getQueue(voiceChannel.id);
                queue.next();
            }
        }

        await this.play({
            interaction,
            connection,
            channelId: voiceChannel.id,
        });

        return true;
    }

    public static async play({
        interaction,
        connection,
        channelId,
    }: {
        interaction: ChatInputCommandInteraction;
        connection: VoiceConnection;
        channelId: string;
    }): Promise<void>
    {
        const audioPlayer = getAudioPlayerData(channelId);

        // Log errors
        audioPlayer.removeAllListeners('error');
        audioPlayer.on('error', (error) =>
        {
            logger.error(`Error playing audio in a voice channel with /vc ${this.key}`, error);
        });

        // Ensure idle event handling only happens one-at-a-time
        audioPlayer.removeAllListeners(AudioPlayerStatus.Idle);
        audioPlayer.on(AudioPlayerStatus.Idle, async () =>
        {
            const queue = getQueue(channelId);

            if (queue.getIsEnabled() && queue.hasNext())
            {
                queue.next();
                await this.playTrack({
                    interaction,
                    connection,
                    channelId,
                });
            }
        });

        await this.playTrack({
            interaction,
            connection,
            channelId,
        });
    }

    private static async playTrack({
        interaction,
        connection,
        channelId,
    }: {
        interaction: ChatInputCommandInteraction;
        connection: VoiceConnection;
        channelId: string;
    }): Promise<void>
    {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<void>(async (resolve) =>
        {
            const queue = getQueue(channelId);
            const audioPlayer = getAudioPlayerData(channelId);

            const { current: currentFile } = queue;
            if (!currentFile)
            {
                await interaction.followUp({
                    content: 'There is no audio in the queue to play.',
                    ephemeral: true,
                });
                resolve();
                return;
            }

            const audioResource = await getAudioResource({
                discordUserId: interaction.user.id,
                fileName: currentFile.fileName,
                shouldLoop: currentFile.shouldLoop,
            });

            if (!audioResource)
            {
                const fileNamesEmbeds = await VcViewFilesStrategy.getFileNamesEmbeds(interaction);
                const queueDataStr = QueueViewStrategy.getQueueDataMessage(channelId);
                // Send messages with pagination (fire and forget)
                // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
                PaginationStrategy.run({
                    originalInteraction: interaction,
                    commandName: `/vc play`,
                    content: `A file named \`${currentFile.fileName}\` does not exist. ${queueDataStr}`,
                    embeds: fileNamesEmbeds,
                    interactionType: 'followUp',
                    ephemeral: true,
                });
                resolve();
                return;
            }

            // Send message to show the command was received
            audioPlayer.once(AudioPlayerStatus.Playing, async () =>
            {
                const queueDataStr = QueueViewStrategy.getQueueDataMessage(channelId);
                const nextFile = queue.getNext();
                const nextMessage = nextFile
                    ? `Next: \`${nextFile.fileName}\`. `
                    : '';

                await interaction.followUp({
                    content: `Playing \`${currentFile.fileName}\`. ${nextMessage}${queueDataStr}`,
                    ephemeral: true,
                });
                VoiceConnectionTimeoutManager.upsert(interaction.guildId!);
                resolve();
            });

            // Play audio
            queue.setIsEnabled(true);
            audioPlayer.play(audioResource);
            // Subscribe the connection to the audio player (will play audio on the voice connection)
            connection.subscribe(audioPlayer);
        });
    }
}
