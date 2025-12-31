import { ObjectId } from 'mongodb';

import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import type { PtuFakemonCollection } from '../dal/models/PtuFakemonCollection.js';

type PtuFakemonSingletonMap = Record<string, PtuFakemonCollection>;

class PtuFakemonSingleton
{
    private singleton: RecordSingleton<string, PtuFakemonCollection>;

    constructor(input: PtuFakemonSingletonMap = {})
    {
        this.singleton = new RecordSingleton(input);
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
