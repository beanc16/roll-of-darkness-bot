import { MongoDbControllerWithEnv } from 'mongodb-controller';

import { Counter } from './models/Counter.js';

export class CounterController extends MongoDbControllerWithEnv
{
    public static collectionName = process.env.COLLECTION_COUNTER as string;
    public static Model = Counter;
}
