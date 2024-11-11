import { Character } from '../commands-slash/Combat_Tracker/dal/RollOfDarknessMongoControllers.js';
import Singleton from './Singleton.js';

interface CharacterSingletonMap
{
    [key: string]: Character[];
}

class CharactersSingleton
{
    #singleton: Singleton<CharacterSingletonMap>;

    constructor(input: CharacterSingletonMap = {})
    {
        this.#singleton = new Singleton(input);
    }

    getAll(): CharacterSingletonMap
    {
        return this.#singleton.get() || {};
    }

    get(key: string): Character[] | undefined
    {
        return this.getAll()[key];
    }

    upsert(key: string, value: Character): void
    {
        const map = this.getAll();
        if (!map[key])
        {
            map[key] = [];
        }

        // Remove the given value if it exists
        map[key] = map[key].filter((element) => element._id?.toString() !== value._id?.toString());

        // Insert the given value
        map[key].push(value);
        this.set(map);
    }

    delete(key: string, value: Character): void
    {
        const map = this.getAll();
        if (!map[key])
        {
            map[key] = [];
        }

        // Remove the given value if it exists
        map[key] = map[key].filter((element) => element._id?.toString() !== value._id?.toString());

        this.set(map);
    }

    set(map: CharacterSingletonMap = {}): void
    {
        this.#singleton.set(map);
    }
}



export default new CharactersSingleton();
