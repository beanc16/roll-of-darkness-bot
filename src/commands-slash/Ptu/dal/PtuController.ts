import { MongoDbController } from 'mongodb-controller';

import { PtuPokemonCollection } from './models/PtuPokemonCollection.js';

export class PokemonController extends MongoDbController
{
    public static dbName = 'ptu-microservice';
    public static collectionName = 'pokemon';
    public static Model = PtuPokemonCollection;
    // TODO: Figure out if it's necessary to add this later or not
    // static sortOptions = {
    //     name: 'ascending',
    // };
}
