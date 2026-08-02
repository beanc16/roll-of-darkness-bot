import { MongoDbController } from 'mongodb-controller';

import { PtuOracleCardCollection } from './models/PtuOracleCardCollection.js';

export class OracleCardController extends MongoDbController
{
    public static dbName = 'roll-of-darkness-bot';
    public static collectionName = 'oracle.card';
    public static Model = PtuOracleCardCollection;
}
