// This is necessary to prevent the bulk initialization of too many discord
// webhooks, which can cause unit tests to get rate limited by discord due
// to initializing too many webhooks.
jest.mock('@beanc16/logger', () =>
{
    const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    };

    return jest.fn(() => mockLogger);
});
