import { ConnectionTimeoutManager } from '../../../../src/commands-slash/Vc/services/ConnectionTimeoutManager.js';

describe('ConnectionTimeoutManager', () =>
{
    const guildId = '12345';

    beforeEach(() =>
    {
        jest.clearAllTimers();
        jest.clearAllMocks();
        jest.useFakeTimers();
        ConnectionTimeoutManager['guildIdToTimestamp'].clear();
        ConnectionTimeoutManager['intervalTimeout'] = undefined;
        ConnectionTimeoutManager['tryEndInterval']();
    });

    afterEach(() =>
    {
        jest.runOnlyPendingTimers();
    });

    describe('get & upsert', () =>
    {
        it('should set and get the guildId to the current timestamp', () =>
        {
            ConnectionTimeoutManager.upsert(guildId);

            expect(ConnectionTimeoutManager.get(guildId)).toBeDefined();
            expect(ConnectionTimeoutManager.get(guildId)).toBeInstanceOf(Date);
        });

        it('should set the interval timeout if it is not already set', () =>
        {
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
            ConnectionTimeoutManager.upsert(guildId);
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeDefined();
        });
    });

    describe('delete', () =>
    {
        it('should delete the guildId from the map', () =>
        {
            ConnectionTimeoutManager.upsert(guildId);
            ConnectionTimeoutManager.delete(guildId);

            expect(ConnectionTimeoutManager.get(guildId)).toBeUndefined();
        });

        it('should clear the interval timeout if the map is empty', () =>
        {
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
            ConnectionTimeoutManager.upsert(guildId);
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeDefined();
            ConnectionTimeoutManager.delete(guildId);
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
        });
    });

    describe('trySetInterval', () =>
    {
        it('should not set the interval timeout if the map is empty', () =>
        {
            ConnectionTimeoutManager['trySetInterval']();
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
        });

        it('should set the interval timeout if it is not already set', () =>
        {
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
            ConnectionTimeoutManager.upsert(guildId);
            ConnectionTimeoutManager['trySetInterval']();
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeDefined();
        });
    });

    describe('tryEndInterval', () =>
    {
        it('should clear the interval timeout if the map is empty', () =>
        {
            // Set interval
            ConnectionTimeoutManager.upsert(guildId);
            ConnectionTimeoutManager['trySetInterval']();
            ConnectionTimeoutManager['guildIdToTimestamp'].clear();
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeDefined();
            expect(ConnectionTimeoutManager['hasNoConnections']).toEqual(true);

            // Clear interval
            ConnectionTimeoutManager['tryEndInterval']();
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeUndefined();
        });

        it('should not clear the interval timeout if the map is not empty', () =>
        {
            // Set interval
            ConnectionTimeoutManager.upsert(guildId);
            ConnectionTimeoutManager['trySetInterval']();
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeDefined();
            expect(ConnectionTimeoutManager['hasNoConnections']).toEqual(false);

            // Clear interval
            ConnectionTimeoutManager['tryEndInterval']();
            expect(ConnectionTimeoutManager['intervalTimeout']).toBeDefined();
        });
    });
});
