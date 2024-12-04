import { Character } from '../commands-slash/Combat_Tracker/dal/types/Character.js';
import { RecordSingleton } from '../services/Singleton/RecordSingleton.js';

type CharacterSingletonMap = Record<string, Character[]>;

class CharactersSingleton
{
    public singleton: RecordSingleton<string, Character[]>;

    constructor(input: CharacterSingletonMap = {})
    {
        this.singleton = new RecordSingleton(input);
    }

    public getAll(): CharacterSingletonMap
    {
        return this.singleton.getAll();
    }

    public get(key: string): Character[] | undefined
    {
        return this.singleton.get(key);
    }

    public set(map: CharacterSingletonMap = {}): void
    {
        this.singleton.set(map);
    }

    public upsert(key: string, value: Character): void
    {
        const map = this.getAll();
        if (!map[key])
        {
            map[key] = [];
        }

        // Remove the given value if it exists
        map[key] = map[key].filter(element => element.id.toString() !== value.id.toString());

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
        map[key] = map[key].filter(element => element.id.toString() !== value.id.toString());

        this.set(map);
    }
}

export default new CharactersSingleton();
