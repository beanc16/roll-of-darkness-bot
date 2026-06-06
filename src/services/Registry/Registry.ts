export class Registry<T>
{
    private registry = new Map<string, T>();

    constructor(registry: Record<string, T> = {})
    {
        this.registerBulk(registry);
    }

    public register(key: string, value: T): void
    {
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
