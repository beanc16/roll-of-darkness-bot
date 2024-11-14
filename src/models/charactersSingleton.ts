import { Character } from '../commands-slash/Combat_Tracker/dal/RollOfDarknessMongoControllers.js';
import Singleton from '../services/Singleton/Singleton.js';

type CharacterSingletonMap = Record<string, Character[]>;

class CharactersSingleton
{
    public singleton: Singleton<CharacterSingletonMap>;

    constructor(input: CharacterSingletonMap = {})
    {
        this.singleton = new Singleton(input);
    }

    public getAll(): CharacterSingletonMap
    {
        return this.singleton.get() || {};
    }

    public get(key: string): Character[] | undefined
    {
        return this.getAll()[key];
    }

    public upsert(key: string, value: Character): void
    {
        const map = this.getAll();
        if (!map[key])
        {
            map[key] = [];
        }

        // Remove the given value if it exists
        map[key] = map[key].filter(element => element._id?.toString() !== value._id?.toString());

        // Insert the given value
        map[key].push(value);
        this.set(map);
    }

    public delete(key: string, value: Character): void
    {
        const map = this.getAll();
        if (!map[key])
        {
            map[key] = [];
        }

        // Remove the given value if it exists
        map[key] = map[key].filter(element => element._id?.toString() !== value._id?.toString());

        this.set(map);
    }

    public set(map: CharacterSingletonMap = {}): void
    {
        this.singleton.set(map);
    }
}

export default new CharactersSingleton();
