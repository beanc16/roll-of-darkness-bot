import { Tracker } from '../commands-slash/Combat_Tracker/dal/types/Tracker.js';
import { RecordSingleton } from '../services/Singleton/RecordSingleton.js';

type CombatTrackerSingletonMap = Record<string, Tracker>;

class CombatTrackersSingleton
{
    private singleton: RecordSingleton<string, Tracker>;

    constructor(input: CombatTrackerSingletonMap = {})
    {
        this.singleton = new RecordSingleton(input);
    }

    public getAll(): CombatTrackerSingletonMap
    {
        return this.singleton.getAll();
    }

    public get(key: string): Tracker
    {
        return this.singleton.get(key);
    }

    public upsert(tracker: Tracker): void
    {
        const trackerId = tracker.id.toString();
        return this.singleton.upsert(trackerId, tracker);
    }

    public set(map: CombatTrackerSingletonMap = {}): void
    {
        this.singleton.set(map);
    }
}

export default new CombatTrackersSingleton();
