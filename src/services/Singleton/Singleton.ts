export default class Singleton<T = unknown>
{
    protected value: T;

    constructor(value: T)
    {
        this.value = value;
    }

    public get(): T
    {
        return this.value;
    }

    public set(value: T): void
    {
        this.value = value;
    }
}
