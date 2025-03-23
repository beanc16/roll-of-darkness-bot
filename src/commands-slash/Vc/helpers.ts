import http from 'node:http';
import https from 'node:https';

import { FileStorageMicroservice, type FileStorageMicroserviceBaseResponseV1 } from '@beanc16/microservices-abstraction';
import {
    type AudioResource,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    NoSubscriberBehavior,
    type VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import {
    ChatInputCommandInteraction,
    type GuildMember,
    type VoiceBasedChannel,
} from 'discord.js';

import { CompositeKeyRecord } from '../../services/CompositeKeyRecord.js';
import { LoopableAudioStream } from './services/LoopableAudioStream.js';
import type { AudioPlayerEmitter } from './types.js';

/* istanbul ignore next */
export const getVcCommandNestedFolderName = (discordUserId: string): string => `vc-commands/${discordUserId}`;

const getHttpModule = (url: string): typeof http | typeof https =>
{
    if (url.startsWith('https'))
    {
        return https;
    }

    return http;
};

export const getVoiceConnectionData = (interaction: ChatInputCommandInteraction): {
    voiceChannel: VoiceBasedChannel | null | undefined;
    existingConnection: VoiceConnection | undefined;
    inSameVoiceChannelAsUser: boolean | undefined;
} =>
{
    const voiceChannel = (interaction?.member as GuildMember | null)?.voice?.channel;
    const existingConnection = getVoiceConnection(interaction.guildId!);
    const inSameVoiceChannelAsUser = (
        existingConnection
        && existingConnection.joinConfig.channelId === voiceChannel?.id
        && existingConnection.state.status === VoiceConnectionStatus.Ready
    );

    return {
        voiceChannel,
        existingConnection,
        inSameVoiceChannelAsUser,
    };
};

let cachedAudioPlayer: AudioPlayerEmitter | undefined;
export const getAudioPlayerData = (): AudioPlayerEmitter =>
{
    if (!cachedAudioPlayer)
    {
        cachedAudioPlayer = createAudioPlayer({
            behaviors: {
                // Pause the player if there is no subscriber
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        }) as AudioPlayerEmitter;
    }

    return cachedAudioPlayer;
};

const convertRemoteFileToBuffer = async (fileUrl: string): Promise<Buffer> =>
{
    const output = await new Promise<Buffer>((resolve, reject) =>
    {
        const chunks: Buffer[] = [];
        const request = getHttpModule(fileUrl).get(fileUrl, (stream) =>
        {
            stream.on('data', (chunk) => chunks.push(chunk as Buffer));
            stream.on('end', () =>
            {
                const result = Buffer.concat(chunks as unknown as Uint8Array<ArrayBufferLike>[]);
                resolve(result);
            });
        });

        request.on('error', reject);
        request.end();
    });

    return output;
};

const audioResourceBufferCache = new CompositeKeyRecord<[string, string], Buffer>();

export const getAudioResourceReadable = async ({
    discordUserId,
    fileName,
    shouldLoop,
}: { discordUserId: string; fileName: string; shouldLoop: boolean }): Promise<LoopableAudioStream | undefined> =>
{
    const output = await new Promise<LoopableAudioStream | undefined>(async (resolve, reject) =>
    {
        try
        {
            // Create audio resource from cache if it exists
            const cachedBuffer = audioResourceBufferCache.Get([discordUserId, fileName]);
            if (cachedBuffer)
            {
                const readable = new LoopableAudioStream(cachedBuffer, shouldLoop);
                resolve(readable);
                return;
            }

            // Otherwise, create audio resource from a fresh url if it exists
            const {
                data: {
                    url: fileUrl,
                },
            } = await FileStorageMicroservice.v1.get({
                appId: process.env.APP_ID as string,
                fileName,
                nestedFolders: getVcCommandNestedFolderName(discordUserId),
            });

            // Convert file url to readable
            const buffer = await convertRemoteFileToBuffer(fileUrl);
            const readable = new LoopableAudioStream(buffer, shouldLoop);

            // Cache buffer in-memory
            audioResourceBufferCache.Upsert([discordUserId, fileName], buffer);
            resolve(readable);
        }

        catch (error)
        {
            const {
                response: {
                    data: { statusCode, message },
                },
            } = error as {
                response: {
                    data: FileStorageMicroserviceBaseResponseV1;
                };
            };

            if (statusCode === 500 && message.toLowerCase().includes('failed to retrieve file'))
            {
                resolve(undefined);
            }
            else
            {
                reject(error);
            }
        }
    });

    return output;
};

export const getAudioResource = async ({
    discordUserId,
    fileName,
    shouldLoop,
}: { discordUserId: string; fileName: string; shouldLoop: boolean }): Promise<AudioResource<null> | undefined> =>
{
    const output = await new Promise<AudioResource<null> | undefined>(async (resolve, reject) =>
    {
        try
        {
            // Get readable for audio resource
            const readable = await getAudioResourceReadable({
                discordUserId,
                fileName,
                shouldLoop,
            });

            if (!readable)
            {
                resolve(undefined);
                return;
            }

            // Create audio resource
            const resource = createAudioResource(readable);
            resolve(resource);
        }

        catch (error)
        {
            reject(error);
        }
    });

    return output;
};

export const isValidAudioUrl = async (fileUrl: string): Promise<boolean> =>
{
    // eslint-disable-next-line no-async-promise-executor
    const output = await new Promise<boolean>((resolve, reject) =>
    {
        try
        {
            // Input is not a valid URL
            if (!URL.canParse(fileUrl))
            {
                resolve(false);
                return;
            }

            getHttpModule(fileUrl).get(fileUrl, (stream) =>
            {
                const {
                    headers: {
                        'content-type': contentType,
                    },
                } = stream;

                if (contentType?.startsWith('audio'))
                {
                    resolve(true);
                }
                else
                {
                    resolve(false);
                }
            });
        }

        catch (error)
        {
            reject(error);
        }
    });

    return output;
};
