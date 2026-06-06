export class Registry<T>
{
    private registry = new Map<string, T>();

    constructor(registry: Record<string, T> = {})
    {
        this.registerBulk(registry);
    }

    public register(key: string, value: T): void;
    public register(key: string[], value: T): void;
    public register(key: string | string[], value: T): void
    {
        if (Array.isArray(key))
        {
            key.forEach(k => this.register(k, value));
            return;
        }

        this.registry.set(key, value);
    }

    public registerBulk(pairs: Record<string, T>): void
    {
        Object.entries(pairs).forEach(([key, value]) =>
        {
            this.register(key, value);
        });
    }

    public get(key: string): T | undefined
    {
        return this.registry.get(key);
    }

    public remove(key: string): void
    {
        this.registry.delete(key);
    }

    public clear(): void
    {
        this.registry.clear();
    }
}
