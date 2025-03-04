import http from 'node:http';
import https from 'node:https';
import { Readable } from 'node:stream';

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

import type { AudioPlayerEmitter } from './types.js';

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

const convertBufferToReadable = (buffer: Buffer): Readable =>
{
    const readable = new Readable();

    // eslint-disable-next-line no-underscore-dangle, @stylistic/brace-style -- Allow for no-op readability
    readable._read = () => { /* No-op */ };
    readable.push(buffer);

    // End stream
    readable.push(null);

    return readable;
};

export const getAudioResource = async ({ discordUserId, fileName }: { discordUserId: string; fileName: string }): Promise<AudioResource<null> | undefined> =>
{
    // eslint-disable-next-line no-async-promise-executor
    const output = await new Promise<AudioResource<null> | undefined>(async (resolve, reject) =>
    {
        try
        {
            const {
                data: {
                    url: fileUrl,
                },
            } = await FileStorageMicroservice.v1.get({
                appId: process.env.APP_ID as string,
                fileName,
                nestedFolders: getVcCommandNestedFolderName(discordUserId),
            });

            const buffer = await convertRemoteFileToBuffer(fileUrl);
            const readable = convertBufferToReadable(buffer);
            const resource = createAudioResource(readable);
            resolve(resource);
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
