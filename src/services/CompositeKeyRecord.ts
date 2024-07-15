type BaseCompositeKey = (string | number | symbol)[];

export class CompositeKeyRecord<CompositeKey extends BaseCompositeKey, Value = unknown>
{
    private record: Record<string, Value>;

    constructor()
    {
        this.record = {};
    }

    public GetAll(): Record<string, Value>
    {
        return this.record;
    }

    public Get(key: CompositeKey): Value
    {
        const parsedKey = this.ParseKey(key);
        return this.record[parsedKey];
    }

    public Add(key: CompositeKey, value: Value): void
    {
        const parsedKey = this.ParseKey(key);
        this.record[parsedKey] = value;
    }

    public Clear(): void
    {
        this.record = {};
    }

    private ParseKey(key: CompositeKey): string
    {
        const parsedKey = key.join(',');
        return parsedKey;
    }
}
