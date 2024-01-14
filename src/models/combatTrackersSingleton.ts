import { AggregatedTrackerWithCharacters, Tracker } from '../dal/RollOfDarknessMongoControllers';
import Singleton from './Singleton';

interface CombatTrackerSingletonMap
{
    [key: string]: Tracker | AggregatedTrackerWithCharacters;
}

class CombatTrackersSingleton
{
    #singleton: Singleton<CombatTrackerSingletonMap>;

    constructor(categoriesEnum: CombatTrackerSingletonMap = {})
    {
        this.#singleton = new Singleton(categoriesEnum);
    }

    getAll(): CombatTrackerSingletonMap
    {
        return this.#singleton.get() || {};
    }

    get(key: string): Tracker | AggregatedTrackerWithCharacters
    {
        return this.getAll()[key];
    }

    upsert(key: string, value: Tracker | AggregatedTrackerWithCharacters): void
    {
        const map = this.getAll();
        map[key] = value;
        this.set(map);
    }

    set(map: CombatTrackerSingletonMap = {}): void
    {
        this.#singleton.set(map);
    }
}



export default new CombatTrackersSingleton();
