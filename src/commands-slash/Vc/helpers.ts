import { createReadStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

/* eslint-disable no-underscore-dangle */ // Matching the old __filename and __dirname standard
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/* eslint-enable no-underscore-dangle */

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

// TODO: Make this handle cloud resources later
export const getAudioResource = (): AudioResource<null> =>
{
    const resourcePath = join(__dirname, './audio.mp3');
    const readStream = createReadStream(resourcePath);
    const resource = createAudioResource(readStream);

    return resource;
};
