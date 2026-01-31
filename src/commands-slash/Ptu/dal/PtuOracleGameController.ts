import { MongoDbController } from 'mongodb-controller';

import { PtuOracleGameCollection } from './models/PtuOracleGameCollection.js';

export class OracleGameController extends MongoDbController
{
    public static dbName = 'ptu-microservice';
    public static collectionName = 'oracle.game';
    public static Model = PtuOracleGameCollection;
}
