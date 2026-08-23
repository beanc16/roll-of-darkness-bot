import { MongoDbController } from 'mongodb-controller';

import { PtuMoveCollection } from './models/PtuMoveCollection.js';

export class PtuMoveController extends MongoDbController
{
    public static dbName = 'ptu-microservice';
    public static collectionName = 'move';
    public static Model = PtuMoveCollection;
}
