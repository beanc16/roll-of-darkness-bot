import { UUID } from 'node:crypto';

import { ObjectId } from 'mongodb';

import { CounterAuditLog, CounterDiscordCreator } from '../types.js';

export interface CounterConstructor
{
    _id?: ObjectId;
    guid: UUID;
    name: string;
    count: number;
    auditLogs: CounterAuditLog[];
    discordCreator: CounterDiscordCreator;
}

export class Counter
{
    public _id?: ObjectId;
    public guid: UUID;
    public name: string;
    public count: number;
    public auditLogs: CounterAuditLog[];
    public discordCreator: CounterDiscordCreator;

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
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = _id;
        }
        else
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = new ObjectId();
        }

        this.guid = guid;
        this.name = name;
        this.count = count;
        this.auditLogs = auditLogs;
        this.discordCreator = discordCreator;
    }
}
