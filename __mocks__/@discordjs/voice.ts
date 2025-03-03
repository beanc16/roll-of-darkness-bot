import type { VoiceConnection } from '@discordjs/voice';

export enum AudioPlayerStatus
{
    AutoPaused = 'autopaused',
    Buffering = 'buffering',
    Idle = 'idle',
    Paused = 'paused',
    Playing = 'playing',
};

export const getVoiceConnection = jest.fn<VoiceConnection | undefined, []>().mockImplementation(() =>
{
    const result: VoiceConnection = {
        destroy: jest.fn(),
        state: {
            subscription: {
                player: {
                    state: {
                        status: AudioPlayerStatus.Idle,
                    },
                },
            },
        },
    } as unknown as VoiceConnection; // TODO: Remove this typecast once all required properties are added

    return result;
});
