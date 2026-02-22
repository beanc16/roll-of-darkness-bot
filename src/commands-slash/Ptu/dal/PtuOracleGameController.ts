import { MongoDbController } from 'mongodb-controller';

import { PtuOracleGameCollection } from './models/PtuOracleGameCollection.js';

export class OracleGameController extends MongoDbController
{
    public static dbName = 'roll-of-darkness-bot';
    public static collectionName = 'oracle.game';
    public static Model = PtuOracleGameCollection;
}
