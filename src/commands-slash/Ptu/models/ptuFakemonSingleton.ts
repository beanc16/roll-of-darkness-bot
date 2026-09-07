import { ObjectId } from 'mongodb';

import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import type { PtuFakemonCollection } from '../dal/models/PtuFakemonCollection.js';

type PtuFakemonSingletonMap = Record<string, PtuFakemonCollection>;

class PtuFakemonSingleton
{
    private singleton: RecordSingleton<string, PtuFakemonCollection>;
    private bulkSingleton: RecordSingleton<string, PtuFakemonCollection[]>;

    constructor(input: PtuFakemonSingletonMap = {})
    {
        this.singleton = new RecordSingleton(input);
        this.bulkSingleton = new RecordSingleton({});
    }

    public getAll(): PtuFakemonSingletonMap
    {
        return this.singleton.getAll();
    }

    public get(key: string): PtuFakemonCollection;
    public get(key: ObjectId): PtuFakemonCollection;
    public get(key: string | ObjectId): PtuFakemonCollection
    {
        return this.singleton.get(key.toString());
    }

    public getBulk(key: string): PtuFakemonCollection[];
    public getBulk(key: ObjectId): PtuFakemonCollection[];
    public getBulk(key: string | ObjectId): PtuFakemonCollection[]
    {
        return this.bulkSingleton.get(key.toString());
    }

    public upsert(messageId: string, fakemon: PtuFakemonCollection): PtuFakemonCollection
    {
        const output = this.singleton.upsert(messageId, fakemon);

        Object.entries(this.getAll()).forEach(([key, value]) =>
        {
            // Skip the current message - it was already upserted
            if (key === messageId)
            {
                return;
            }

            // Update the state of the same fakemon on other messages
            if (value.id.equals(fakemon.id))
            {
                this.singleton.upsert(key, fakemon);
            }
        });

        return output;
    }

    public upsertBulk(messageId: string, fakemons: PtuFakemonCollection[]): PtuFakemonCollection[]
    {
        const output = this.bulkSingleton.upsert(messageId, fakemons);

        const fakemonIdToFakemon = fakemons.reduce<Record<string, PtuFakemonCollection>>((acc, cur) => ({
            ...acc,
            [cur.id.toString()]: cur,
        }), {});

        Object.entries(this.bulkSingleton.getAll()).forEach(([key, value]) =>
        {
            // Skip the current message - it was already upserted
            if (key === messageId)
            {
                return;
            }

            let hasChanged = false;
            const updatedValue = [...value].map((curValue) =>
            {
                const curFakemon = fakemonIdToFakemon[curValue.id.toString()];

                // Update the state of the same fakemon on other messages
                if (curFakemon && curValue.id.equals(curFakemon.id))
                {
                    hasChanged = true;
                    return curFakemon;
                }

                return curValue;
            });

            if (hasChanged)
            {
                this.bulkSingleton.upsert(key, updatedValue);
            }
        });

        return output;
    }

    public set(map: PtuFakemonSingletonMap = {}): void
    {
        this.singleton.set(map);
    }

    public remove(key: string): void
    {
        this.singleton.remove(key);
    }
}

export default new PtuFakemonSingleton();
