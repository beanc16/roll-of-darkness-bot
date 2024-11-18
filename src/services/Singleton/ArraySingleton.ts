import Singleton from './Singleton.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow for generic
export class ArraySingleton<T extends any[] = unknown[]> extends Singleton<T>
{
    public push(...items: T[number][]): void
    {
        this.value.push(items);
    }

    // TODO: Add other native array methods like forEach, map, reduce, etc.
}
