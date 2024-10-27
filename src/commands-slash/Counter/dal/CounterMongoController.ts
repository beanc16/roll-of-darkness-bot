import { UUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { MongoDbControllerWithEnv } from 'mongodb-controller';

export enum CounterOperation
{
    Plus = 'added 1',
    Minus = 'subtracted 1',
}

export interface CounterAuditLog
{
    userId: string;
    operation: CounterOperation;
}

interface DiscordCreator
{
    userId: string;
    serverId: string;
    messageId: string;
}

interface CounterConstructor
{
    _id?: ObjectId;
    guid: UUID;
    count: number;
    auditLogs: CounterAuditLog[];
    discordCreator: DiscordCreator;
}

export class Counter
{
    _id?: ObjectId;
    guid: UUID;
    count: number;
    auditLogs: CounterAuditLog[];
    discordCreator: DiscordCreator;

    constructor({
        _id,
        guid,
        count,
        auditLogs = [],
        discordCreator,
    }: CounterConstructor)
    {
        if (_id)
        {
            this._id = _id;
        }
        else
        {
            this._id = new ObjectId();
        }

        this.guid = guid;
        this.count = count;
        this.auditLogs = auditLogs;
        this.discordCreator = discordCreator;
    }
}

export class CounterController extends MongoDbControllerWithEnv
{
    static collectionName = process.env.COLLECTION_COUNTER as string;
    static Model = Counter;
}
