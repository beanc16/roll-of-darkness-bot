import { MongoDbController } from 'mongodb-controller';

import { PtuOracleCardCollection } from './models/PtuOracleCardCollection.js';

export class OracleCardController extends MongoDbController
{
    public static dbName = 'ptu-microservice';
    public static collectionName = 'oracle.card';
    public static Model = PtuOracleCardCollection;
}
