import { MongoDbControllerWithEnv, MongoDbResults } from 'mongodb-controller';

import { Tracker } from './types/Tracker.js';

export interface TrackerResponse extends MongoDbResults
{
    results: {
        model: Tracker;
        result: object;
    };
}

export interface TrackerUpdateResponse extends MongoDbResults
{
    results: {
        old: Tracker;
        new: Tracker;
    };
}

export class TrackerController extends MongoDbControllerWithEnv
{
    public static collectionName = process.env.COLLECTION_TRACKER as string;
    public static Model = Tracker;
}
