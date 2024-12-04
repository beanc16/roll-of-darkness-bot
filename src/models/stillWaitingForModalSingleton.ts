import { RecordSingleton } from '../services/Singleton/RecordSingleton.js';

type StillWaitingForModalSingletonMap = Record<string, boolean>;

class StillWaitingForModalSingleton
{
    private singleton: RecordSingleton<string, boolean>;

    constructor(input: StillWaitingForModalSingletonMap = {})
    {
        this.singleton = new RecordSingleton(input);
    }

    public getAll(): StillWaitingForModalSingletonMap
    {
        return this.singleton.getAll();
    }

    public get(key: string): boolean
    {
        return this.singleton.get(key);
    }

    public upsert(key?: string, value: boolean = true): void
    {
        if (!key)
        {
            return;
        }

        this.singleton.upsert(key, value);
    }
}

export default new StillWaitingForModalSingleton();
