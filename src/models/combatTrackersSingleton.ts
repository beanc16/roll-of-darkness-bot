import { AggregatedTrackerWithCharacters } from '../dal/RollOfDarknessMongoControllers';
import Singleton from './Singleton';

interface CombatTrackerSingletonMap
{
    [key: string]: AggregatedTrackerWithCharacters;
}

class CombatTrackersSingleton
{
    #singleton: Singleton<CombatTrackerSingletonMap>;

    constructor(categoriesEnum: CombatTrackerSingletonMap = {})
    {
        this.#singleton = new Singleton(categoriesEnum);
    }

    isInitialized(): boolean
    {
        return (Object.keys(this.getAll())?.length > 0);
    }

    getAll(): CombatTrackerSingletonMap
    {
        return this.#singleton.get() || {};
    }

    get(key: string): AggregatedTrackerWithCharacters
    {
        return this.getAll()[key];
    }

    set(categoriesEnum: CombatTrackerSingletonMap = {}): void
    {
        this.#singleton.set(categoriesEnum);
    }
}



export default new CombatTrackersSingleton();
