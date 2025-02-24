import https from 'node:https';

import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';
import {
    type AudioPlayer,
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

let cachedAudioPlayer: AudioPlayer | undefined;
export const getAudioPlayerData = (): AudioPlayer =>
{
    if (!cachedAudioPlayer)
    {
        cachedAudioPlayer = createAudioPlayer({
            behaviors: {
                // Pause the player if there is no subscriber
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
    }

    return cachedAudioPlayer;
};

export const getAudioResource = async ({ discordUserId }: { discordUserId: string }): Promise<AudioResource<null>> =>
{
    // eslint-disable-next-line no-async-promise-executor
    const output = await new Promise<AudioResource<null>>(async (resolve, reject) =>
    {
        try
        {
            const {
                data: {
                    url: imageUrl,
                },
            } = await FileStorageMicroservice.v1.get({
                appId: process.env.APP_ID as string,
                fileName: 'audio', // TODO: Make this a parameter later
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
            reject(error);
        }
    });

    return output;
};
