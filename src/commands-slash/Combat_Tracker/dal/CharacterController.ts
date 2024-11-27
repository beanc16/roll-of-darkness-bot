import { MongoDbControllerWithEnv, MongoDbResults } from 'mongodb-controller';

import { Character } from './types/Character.js';

export interface CharacterResponse extends MongoDbResults
{
    results: {
        model: Character;
        result: object;
    };
}

export interface CharacterUpdateResponse extends MongoDbResults
{
    results: {
        old: Character;
        new: Character;
    };
}

export class CharacterController extends MongoDbControllerWithEnv
{
    public static collectionName = process.env.COLLECTION_CHARACTER as string;
    public static Model = Character;
}
