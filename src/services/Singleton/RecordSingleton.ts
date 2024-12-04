import Singleton from './Singleton.js';

export class RecordSingleton<
    Key extends string | number | symbol,
    Value,
>
{
    private singleton: Singleton<Record<Key, Value>>;

    constructor(params?: Record<Key, Value>)
    {
        this.singleton = new Singleton(params ?? {} as Record<Key, Value>);
    }

    public getAll(): Record<Key, Value>
    {
        return this.singleton.get() ?? {};
    }

    public get(key: Key): Value
    {
        return this.getAll()[key];
    }

    public set(value: Record<Key, Value>): void
    {
        this.singleton.set(value);
    }

    public upsert(key: Key, value: Value): void
    {
        const map = this.getAll();
        map[key] = value;
        this.set(map);
    }

    public remove(key: Key): void
    {
        const {
            [key]: _,
            ...remainingProperties
        } = this.getAll();

        this.set(remainingProperties as Record<Key, Value>);
    }
}
