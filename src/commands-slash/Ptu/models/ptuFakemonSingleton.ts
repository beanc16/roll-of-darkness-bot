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
        return this.singleton.upsert(messageId, fakemon);
    }

    public set(map: PtuFakemonSingletonMap = {}): void
    {
        this.singleton.set(map);
    }
}

export default new PtuFakemonSingleton();
