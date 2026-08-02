import { Timer } from './Timer.js';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe('class: Timer', () =>
{
    let seconds: number;

    beforeEach(() =>
    {
        seconds = 2;
    });

    describe('method: wait', () =>
    {
        it('should resolve after the specified number of seconds without calling a callback if not provided', async () =>
        {
            const waitPromise = Timer.wait({ seconds });
            expect(setTimeout).toHaveBeenCalledWith(
                expect.any(Function),
                seconds * 1000,
            );

            jest.advanceTimersByTime(seconds * 1000);

            await waitPromise;
        });

        it('should call the callback if provided', async () =>
        {
            const callback = jest.fn();

            const waitPromise = Timer.wait({ seconds, callback });
            jest.advanceTimersByTime(seconds * 1000);

            await waitPromise;
            expect(callback).toHaveBeenCalled();
        });

        it('should call the callback with parameters if provided', async () =>
        {
            const parameters = { data: 'test' };
            const callback = jest.fn();

            const waitPromise = Timer.wait({
                seconds,
                parameters,
                callback,
            });
            jest.advanceTimersByTime(seconds * 1000);

            await waitPromise;
            expect(callback).toHaveBeenCalledWith(parameters);
        });
    });

    describe('method: waitUntilTrue', () =>
    {
        let callCount: number;

        beforeEach(() =>
        {
            callCount = 0;
        });

        it('should resolve after the specified number of seconds when callback returns true', async () =>
        {
            const callback = jest.fn().mockReturnValue(true) as () => boolean;

            const waitUntilTruePromise = Timer.waitUntilTrue({ seconds, callback });
            jest.advanceTimersByTime(seconds * 1000);

            await waitUntilTruePromise;
            expect(callback).toHaveBeenCalled();
        });

        it('should keep retrying until callback returns true', async () =>
        {
            // Return true on the third call
            const callback = jest.fn(() =>
            {
                callCount += 1;
                return (callCount === 3);
            });

            const waitUntilTruePromise = Timer.waitUntilTrue({ seconds, callback });

            jest.advanceTimersByTime(seconds * 1000); // 1st try, false
            jest.advanceTimersByTime(seconds * 1000); // 2nd try, false
            jest.advanceTimersByTime(seconds * 1000); // 3rd try, true

            await waitUntilTruePromise;
            expect(callback).toHaveBeenCalledTimes(3);
        });

        it('should use the correct delay between retries', async () =>
        {
            // Return true on the second call
            const callback = jest.fn(() =>
            {
                callCount += 1;
                return (callCount === 2);
            });

            const waitUntilTruePromise = Timer.waitUntilTrue({ seconds, callback });

            jest.advanceTimersByTime(seconds * 1000); // 1st try, false
            jest.advanceTimersByTime(seconds * 1000); // 2nd try, true

            await waitUntilTruePromise;
            expect(callback).toHaveBeenCalledTimes(2);
            expect(setTimeout).toHaveBeenNthCalledWith(
                1,
                expect.any(Function),
                seconds * 1000,
            );
            expect(setTimeout).toHaveBeenNthCalledWith(
                2,
                expect.any(Function),
                seconds * 1000,
            );
        });
    });

    describe('method: startTimer', () =>
    {
        it('should set the start time for the specified key', () =>
        {
            const key = 'test';
            Timer.startTimer(key);
            expect(Timer['startTimes'][key]).toBeDefined();
        });
    });

    describe('method: getTimeElapsed', () =>
    {
        it('should return the time elapsed since the start time for the specified key', () =>
        {
            const key = 'test';
            Timer.startTimer(key);

            jest.advanceTimersByTime(seconds * 1000);
            const timeElapsed = Timer.getTimeElapsed(key);

            expect(timeElapsed).toBeGreaterThanOrEqual(2000);
        });
    });

    describe('method: clearTimer', () =>
    {
        it('should clear the start time for the specified key', () =>
        {
            const key = 'test';
            Timer.startTimer(key);
            expect(Timer['startTimes'][key]).toBeDefined();

            Timer.clearTimer(key);
            expect(Timer['startTimes'][key]).toBeUndefined();
        });
    });
});
