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
            setTimeout(async () =>
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
            setTimeout(async () =>
            {
                if (callback())
                {
                    resolve();
                }

                else
                {
                    resolve(
                        await this.waitUntilTrue({ seconds, callback }),
                    );
                }
            }, seconds * 1000);
        });
    }
}
