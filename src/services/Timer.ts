export class Timer
{
    static wait <CallbackParameters = never>({
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
}
