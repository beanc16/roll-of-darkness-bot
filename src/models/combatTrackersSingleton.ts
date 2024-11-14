import { Tracker } from '../commands-slash/Combat_Tracker/dal/RollOfDarknessMongoControllers.js';
import Singleton from '../services/Singleton/Singleton.js';

type CombatTrackerSingletonMap = Record<string, Tracker>;

class CombatTrackersSingleton
{
    private singleton: Singleton<CombatTrackerSingletonMap>;

    constructor(input: CombatTrackerSingletonMap = {})
    {
        this.singleton = new Singleton(input);
    }

    public getAll(): CombatTrackerSingletonMap
    {
        return this.singleton.get() || {};
    }

    public get(key: string): Tracker
    {
        return this.getAll()[key];
    }

    public upsert(tracker: Tracker): void
    {
        const trackerId = tracker._id?.toString() as string;
        const map = this.getAll();
        map[trackerId] = tracker;
        this.set(map);
    }

    public set(map: CombatTrackerSingletonMap = {}): void
    {
        this.singleton.set(map);
    }
}

export default new CombatTrackersSingleton();
