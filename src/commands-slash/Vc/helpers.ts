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

import type { AudioPlayerEmitter } from './types.js';

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

export const getAudioResource = async ({ discordUserId, fileName }: { discordUserId: string; fileName: string }): Promise<AudioResource<null> | undefined> =>
{
    // eslint-disable-next-line no-async-promise-executor
    const output = await new Promise<AudioResource<null> | undefined>(async (resolve, reject) =>
    {
        try
        {
            const {
                data: {
                    url: imageUrl,
                },
            } = await FileStorageMicroservice.v1.get({
                appId: process.env.APP_ID as string,
                fileName,
                nestedFolders: `vc-commands/${discordUserId}`,
            });

            https.get(imageUrl, (stream) =>
            {
                const resource = createAudioResource(stream);
                resolve(resource);
            });
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
