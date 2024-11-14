import { MongoDbControllerWithEnv, MongoDbResults } from 'mongodb-controller';

import { AggregatedTrackerWithCharacters } from './types/AggregatedTrackerWithCharacters.js';

// Tracker & Character Aggregated Collection
export interface AggregatedTrackerWithCharactersResponse extends MongoDbResults
{
    results: AggregatedTrackerWithCharacters[];
}

export class AggregatedTrackerWithCharactersController extends MongoDbControllerWithEnv
{
    public static collectionName = process.env.COLLECTION_TRACKER as string;
    public static Model = AggregatedTrackerWithCharacters;

    // Calling AggregatedTrackerWithCharactersController.aggregate() will use this by default to return the Model set above.
    public static aggregateArrayOptions = [
        {
            // Join tracker with character
            $lookup: {
                from: 'character',
                localField: 'characterIds',
                foreignField: '_id',
                as: 'characters',
            },
        },
        {
            // Exclude characterIds from the output (since it was only used for initial aggregation)
            $unset: 'characterIds',
        },
    ];

    // TODO: Update type for accuracy.
    public static async getAll(): Promise<AggregatedTrackerWithCharactersResponse>
    {
        return await this.aggregate(this.aggregateArrayOptions);
    }

    // TODO: Update type for accuracy.
    public static async getByTrackerName(name: string): Promise<AggregatedTrackerWithCharactersResponse>
    {
        return await this.aggregate([
            {
                $match: {
                    name,
                },
            },
            ...this.aggregateArrayOptions,
        ]);
    }
}
