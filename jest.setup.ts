expect.extend({
    toThrowAggregateError(received: () => void, ...expectedMessages: string[])
    {
        try
        {
            received();
        }
        catch (e)
        {
            if (!(e instanceof AggregateError))
            {
                return {
                    pass: false,
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    message: () => `Expected AggregateError, got ${e}`,
                };
            }

            const actualMessages = (e).errors.map((err: Error) => err.message);
            const missing = expectedMessages.filter((msg) => !actualMessages.includes(msg));

            return missing.length === 0
                ? {
                    pass: true,
                    message: () => 'AggregateError matched',
                }
                : {
                    pass: false,
                    message: () => `Missing errors: ${missing.join(', ')}`,
                };
        }

        return {
            pass: false,
            message: () => 'Expected function to throw',
        };
    },
});
