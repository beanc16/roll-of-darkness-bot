export default class Singleton<T = unknown>
{
    protected value: T;

    constructor(value: T)
    {
        this.value = value;
    }

    public get()
    {
        return this.value;
    }

    public set(value: T)
    {
        this.value = value;
    }
}

export class ArraySingleton<T extends any[] = unknown[]> extends Singleton<T>
{
    public push(...items: T[number][])
    {
        this.value.push(items);
    }

    // TODO: Add other native array methods like forEach, map, reduce, etc.
}
