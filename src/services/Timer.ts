export class Timer
{
    public static wait <CallbackParameters = never>({
        seconds,
        parameters,
        callback,
    }: {
        seconds: number;
        parameters?: CallbackParameters;
        callback?: (parameters?: CallbackParameters) => void;
    }): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            setTimeout(() =>
            {
                if (callback)
                {
                    callback(parameters);
                }

                resolve();
            }, seconds * 1000);
        });
    }

    public static waitUntilTrue({ seconds, callback }: {
        seconds: number;
        callback: () => boolean;
    }): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            const refreshIntervalId = setInterval(() =>
            {
                if (callback())
                {
                    clearInterval(refreshIntervalId);
                    resolve(undefined);
                }
            }, seconds * 1000);
        });
    }
}
