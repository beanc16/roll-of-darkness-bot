import Singleton from './Singleton.js';

interface StillWaitingForModalSingletonMap
{
    [key: string]: boolean;
}

class StillWaitingForModalSingleton
{
    #singleton: Singleton<StillWaitingForModalSingletonMap>;

    constructor(input: StillWaitingForModalSingletonMap = {})
    {
        this.#singleton = new Singleton(input);
    }

    getAll(): StillWaitingForModalSingletonMap
    {
        return this.#singleton.get() || {};
    }

    get(key: string): boolean
    {
        return this.getAll()[key];
    }

    set(key?: string, value: boolean = true): void
    {
        if (!key)
        {
            return;
        }

        const map = this.getAll();
        map[key] = value;
        this.#singleton.set(map);
    }
}

export default new StillWaitingForModalSingleton();
