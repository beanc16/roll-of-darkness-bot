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

    public Get(key: Key): Value | undefined
    {
        const parsedKey = CompositeKeyRecord.ParseKey(key);
        return this.record[parsedKey];
    }

    public Has(key: Key): boolean
    {
        return !!this.Get(key);
    }

    public Upsert(key: Key, value: Value): void
    {
        const parsedKey = CompositeKeyRecord.ParseKey(key);
        this.record[parsedKey] = value;
    }

    public Clear(key?: Key): void
    {
        if (key)
        {
            const parsedKey = CompositeKeyRecord.ParseKey(key);

            const {
                [parsedKey]: _,
                ...remainingProperties
            } = this.record;

            this.record = remainingProperties;
            return;
        }

        this.record = {};
    }

    private static ParseKey<Key extends CompositeKey>(key: Key): string
    {
        // The same as key.join(','). This is necessary because you can't .join on the Symbol type.
        const parsedKey = key.reduce<string>((acc, str, index) =>
        {
            if (index === 0)
            {
                return str.toString();
            }

            return `${acc},${str.toString()}`;
        }, '');

        return parsedKey;
    }
}
