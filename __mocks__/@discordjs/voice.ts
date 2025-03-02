import type { VoiceConnection } from '@discordjs/voice';

export const getVoiceConnection = jest.fn<VoiceConnection | undefined, []>().mockImplementation(() =>
{
    const result: VoiceConnection = {
        destroy: jest.fn(),
    } as unknown as VoiceConnection; // TODO: Remove this typecast once all required properties are added

    return result;
});
