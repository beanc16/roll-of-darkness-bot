import { UUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { MongoDbControllerWithEnv } from 'mongodb-controller';
import { CounterType } from '../../options/counter.js';

export enum CounterOperation
{
    Plus = 'added 1',
    Minus = 'subtracted 1',
}

export interface CounterAuditLog
{
    userId: string;
    operation: CounterOperation;
    timestamp: Date;
}

interface DiscordCreator
{
    userId: string;
    serverId?: string;
    channelId: string;
    messageId: string;
}

interface CounterConstructor
{
    _id?: ObjectId;
    guid: UUID;
    name: string;
    count: number;
    auditLogs: CounterAuditLog[];
    discordCreator: DiscordCreator;
}

export class CounterContainer
{
    private counter: Counter;
    private type: CounterType;
    private isInDatabase: boolean;

    constructor(params: CounterConstructor, type: CounterType, isInDatabase?: boolean)
    {
        this.counter = new Counter(params);
        this.type = type;
        this.isInDatabase = !!isInDatabase;
    }

    public get guid()
    {
        return this.counter.guid;
    }

    public get count()
    {
        return this.counter.count;
    }

    public set count(value: number)
    {
        this.counter.count = value;
    }

    public get counterType()
    {
        return this.type;
    }

    public getCounter()
    {
        return this.counter;
    }

    public addAuditLog(auditLog: CounterAuditLog)
    {
        this.counter.auditLogs.push(auditLog);
    }

    public hasBeenSavedToDatabase(): boolean
    {
        return this.isInDatabase;
    }

    public setHasBeenSavedToDatabase(value: boolean)
    {
        this.isInDatabase = value;
    }
}

export class Counter
{
    _id?: ObjectId;
    guid: UUID;
    name: string;
    count: number;
    auditLogs: CounterAuditLog[];
    discordCreator: DiscordCreator;

    constructor({
        _id,
        guid,
        name,
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
        this.name = name;
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
