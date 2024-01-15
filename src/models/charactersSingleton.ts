import { Character } from '../dal/RollOfDarknessMongoControllers';
import Singleton from './Singleton';

interface CharacterSingletonMap
{
    [key: string]: Character;
}

class CharactersSingleton
{
    #singleton: Singleton<CharacterSingletonMap>;

    constructor(categoriesEnum: CharacterSingletonMap = {})
    {
        this.#singleton = new Singleton(categoriesEnum);
    }

    getAll(): CharacterSingletonMap
    {
        return this.#singleton.get() || {};
    }

    get(key: string): Character
    {
        return this.getAll()[key];
    }

    upsert(key: string, value: Character): void
    {
        const map = this.getAll();
        map[key] = value;
        this.set(map);
    }

    set(map: CharacterSingletonMap = {}): void
    {
        this.#singleton.set(map);
    }
}



export default new CharactersSingleton();
