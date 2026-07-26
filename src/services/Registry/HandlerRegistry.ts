import { Registry } from './Registry.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class HandlerRegistry<T extends (...args: any) => any> extends Registry<T>
{
    public executeHandler(key: string, ...args: Parameters<T>): ReturnType<T>
    {
        const handler = this.get(key);

        if (handler === undefined)
        {
            throw new Error(`No handler registered for key: ${key}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return handler(...args);
    }
}
