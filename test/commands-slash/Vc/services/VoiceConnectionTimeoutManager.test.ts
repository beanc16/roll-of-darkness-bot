import { getVoiceConnection } from '@discordjs/voice';

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

        it('should destroy connections for expired guildIds', () =>
        {
            const guildId1 = '12345';
            const guildId2 = '67890';
            const guildId3 = '11111'; // Not expired

            const connection1 = { destroy: jest.fn() };
            const connection2 = { destroy: jest.fn() };
            const connection3 = { destroy: jest.fn() };
            (getVoiceConnection as jest.Mock)
                .mockReturnValueOnce(connection1)
                .mockReturnValueOnce(connection2)
                .mockReturnValueOnce(connection3);

            // Set connections 1 & 2 as expired, but 3 as unexpired
            const expiredTimestamp = new Date(Date.now() - VoiceConnectionTimeoutManager['validConnectionDuration'] - 1000);
            const unexpiredTimestamp = new Date();
            VoiceConnectionTimeoutManager['guildIdToTimestamp'].set(guildId1, expiredTimestamp);
            VoiceConnectionTimeoutManager['guildIdToTimestamp'].set(guildId2, expiredTimestamp);
            VoiceConnectionTimeoutManager['guildIdToTimestamp'].set(guildId3, unexpiredTimestamp);
            VoiceConnectionTimeoutManager['trySetInterval']();

            jest.advanceTimersByTime(VoiceConnectionTimeoutManager['connectionCheckFrequency']);
            expect(connection1.destroy).toHaveBeenCalledTimes(1);
            expect(connection2.destroy).toHaveBeenCalledTimes(1);
            expect(connection3.destroy).not.toHaveBeenCalled();
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

    describe('destroyAllConnections', () =>
    {
        it('should destroy all connections', () =>
        {
            const guildId1 = '12345';
            const guildId2 = '67890';
            VoiceConnectionTimeoutManager.upsert(guildId1);
            VoiceConnectionTimeoutManager.upsert(guildId2);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
            const destroyConnectionSpy = jest.spyOn(VoiceConnectionTimeoutManager as any, 'destroyConnection');
            VoiceConnectionTimeoutManager.destroyAllConnections();

            expect(destroyConnectionSpy).toHaveBeenCalledTimes(2);
            expect(destroyConnectionSpy).toHaveBeenCalledWith(guildId1);
            expect(destroyConnectionSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('destroyConnection', () =>
    {
        it('should destroy the voice connection if it exists', () =>
        {
            const connection = { destroy: jest.fn() };
            (getVoiceConnection as jest.Mock).mockReturnValue(connection);
            VoiceConnectionTimeoutManager['destroyConnection'](guildId);

            expect(getVoiceConnection).toHaveBeenCalledTimes(1);
            expect(connection.destroy).toHaveBeenCalledTimes(1);
        });

        it('should not destroy the voice connection if it does not exist', () =>
        {
            const connection = { destroy: jest.fn() };
            (getVoiceConnection as jest.Mock).mockReturnValue(undefined);
            VoiceConnectionTimeoutManager['destroyConnection'](guildId);

            expect(getVoiceConnection).toHaveBeenCalledTimes(1);
            expect(connection.destroy).toHaveBeenCalledTimes(0);
        });

        it('should try to end interval', () =>
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
            const tryEndIntervalSpy = jest.spyOn(VoiceConnectionTimeoutManager as any, 'tryEndInterval');
            VoiceConnectionTimeoutManager['destroyConnection'](guildId);

            expect(tryEndIntervalSpy).toHaveBeenCalledTimes(1);
        });
    });
});
