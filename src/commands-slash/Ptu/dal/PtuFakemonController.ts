import { MongoDbController } from 'mongodb-controller';

import { PtuFakemonCollection } from './models/PtuFakemonCollection.js';

export class FakemonController extends MongoDbController
{
    public static dbName = 'ptu-microservice';
    public static collectionName = 'fakemon';
    public static Model = PtuFakemonCollection;
}
