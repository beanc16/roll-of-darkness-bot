import { Tracker } from '../commands-slash/Combat_Tracker/dal/RollOfDarknessMongoControllers.js';
import Singleton from './Singleton.js';

interface CombatTrackerSingletonMap
{
    [key: string]: Tracker;
}

class CombatTrackersSingleton
{
    #singleton: Singleton<CombatTrackerSingletonMap>;

    constructor(input: CombatTrackerSingletonMap = {})
    {
        this.#singleton = new Singleton(input);
    }

    getAll(): CombatTrackerSingletonMap
    {
        return this.#singleton.get() || {};
    }

    get(key: string): Tracker
    {
        return this.getAll()[key];
    }

    upsert(tracker: Tracker): void
    {
        const trackerId = tracker._id?.toString() as string;
        const map = this.getAll();
        map[trackerId] = tracker;
        this.set(map);
    }

    set(map: CombatTrackerSingletonMap = {}): void
    {
        this.#singleton.set(map);
    }
}

export default new CombatTrackersSingleton();
