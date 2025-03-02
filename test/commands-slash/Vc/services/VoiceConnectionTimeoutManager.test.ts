import { VoiceConnectionTimeoutManager } from '../../../../src/commands-slash/Vc/services/VoiceConnectionTimeoutManager.js';

describe('VoiceConnectionTimeoutManager', () =>
{
    const guildId = '12345';

    beforeEach(() =>
    {
        jest.clearAllTimers();
        jest.clearAllMocks();
        jest.useFakeTimers();
        VoiceConnectionTimeoutManager['guildIdToTimestamp'].clear();
        VoiceConnectionTimeoutManager['intervalTimeout'] = undefined;
        VoiceConnectionTimeoutManager['tryEndInterval']();
    });

    afterEach(() =>
    {
        jest.runOnlyPendingTimers();
    });

    describe('get & upsert', () =>
    {
        it('should set and get the guildId to the current timestamp', () =>
        {
            VoiceConnectionTimeoutManager.upsert(guildId);

            expect(VoiceConnectionTimeoutManager.get(guildId)).toBeDefined();
            expect(VoiceConnectionTimeoutManager.get(guildId)).toBeInstanceOf(Date);
        });

        it('should set the interval timeout if it is not already set', () =>
        {
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
            VoiceConnectionTimeoutManager.upsert(guildId);
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeDefined();
        });
    });

    describe('delete', () =>
    {
        it('should delete the guildId from the map', () =>
        {
            VoiceConnectionTimeoutManager.upsert(guildId);
            VoiceConnectionTimeoutManager.delete(guildId);

            expect(VoiceConnectionTimeoutManager.get(guildId)).toBeUndefined();
        });

        it('should clear the interval timeout if the map is empty', () =>
        {
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
            VoiceConnectionTimeoutManager.upsert(guildId);
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeDefined();
            VoiceConnectionTimeoutManager.delete(guildId);
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
        });
    });

    describe('trySetInterval', () =>
    {
        it('should not set the interval timeout if the map is empty', () =>
        {
            VoiceConnectionTimeoutManager['trySetInterval']();
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
        });

        it('should set the interval timeout if it is not already set', () =>
        {
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
            VoiceConnectionTimeoutManager.upsert(guildId);
            VoiceConnectionTimeoutManager['trySetInterval']();
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeDefined();
        });
    });

    describe('tryEndInterval', () =>
    {
        it('should clear the interval timeout if the map is empty', () =>
        {
            // Set interval
            VoiceConnectionTimeoutManager.upsert(guildId);
            VoiceConnectionTimeoutManager['trySetInterval']();
            VoiceConnectionTimeoutManager['guildIdToTimestamp'].clear();
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeDefined();
            expect(VoiceConnectionTimeoutManager['hasNoConnections']).toEqual(true);

            // Clear interval
            VoiceConnectionTimeoutManager['tryEndInterval']();
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
        });

        it('should not clear the interval timeout if the map is not empty', () =>
        {
            // Set interval
            VoiceConnectionTimeoutManager.upsert(guildId);
            VoiceConnectionTimeoutManager['trySetInterval']();
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeDefined();
            expect(VoiceConnectionTimeoutManager['hasNoConnections']).toEqual(false);

            // Clear interval
            VoiceConnectionTimeoutManager['tryEndInterval']();
            expect(VoiceConnectionTimeoutManager['intervalTimeout']).toBeDefined();
        });
    });
});
