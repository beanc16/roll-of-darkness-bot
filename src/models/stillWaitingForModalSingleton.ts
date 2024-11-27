import Singleton from '../services/Singleton/Singleton.js';

type StillWaitingForModalSingletonMap = Record<string, boolean>;

class StillWaitingForModalSingleton
{
    private singleton: Singleton<StillWaitingForModalSingletonMap>;

    constructor(input: StillWaitingForModalSingletonMap = {})
    {
        this.singleton = new Singleton(input);
    }

    public getAll(): StillWaitingForModalSingletonMap
    {
        return this.singleton.get() || {};
    }

    public get(key: string): boolean
    {
        return this.getAll()[key];
    }

    public set(key?: string, value: boolean = true): void
    {
        if (!key)
        {
            return;
        }

        const map = this.getAll();
        map[key] = value;
        this.singleton.set(map);
    }
}

export default new StillWaitingForModalSingleton();
