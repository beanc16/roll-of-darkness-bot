export type CompositeKey = (string | number | symbol)[];

export class CompositeKeyRecord<Key extends CompositeKey, Value>
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

    public Get(key: Key): Value
    {
        const parsedKey = this.ParseKey(key);
        return this.record[parsedKey];
    }

    public Has(key: Key): boolean
    {
        return !!this.Get(key)
    }

    public Upsert(key: Key, value: Value): void
    {
        const parsedKey = this.ParseKey(key);
        this.record[parsedKey] = value;
    }

    public Clear(key?: Key): void
    {
        if (key)
        {
            const parsedKey = this.ParseKey(key);

            const {
                [parsedKey]: _,
                ...remainingProperties
            } = this.record;

            this.record = remainingProperties;
            return;
        }

        this.record = {};
    }

    private ParseKey(key: Key): string
    {
        const parsedKey = key.join(',');
        return parsedKey;
    }
}
