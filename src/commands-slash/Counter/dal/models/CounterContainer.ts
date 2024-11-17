import { UUID } from 'node:crypto';

import { CounterType } from '../../../options/counter.js';
import { CounterAuditLog } from '../types.js';
import { Counter, CounterConstructor } from './Counter.js';

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

    get guid(): UUID
    {
        return this.counter.guid;
    }

    get count(): number
    {
        return this.counter.count;
    }

    set count(value: number)
    {
        this.counter.count = value;
    }

    get counterType(): CounterType
    {
        return this.type;
    }

    public getCounter(): Counter
    {
        return this.counter;
    }

    public addAuditLog(auditLog: CounterAuditLog): void
    {
        this.counter.auditLogs.push(auditLog);
    }

    public hasBeenSavedToDatabase(): boolean
    {
        return this.isInDatabase;
    }

    public setHasBeenSavedToDatabase(value: boolean): void
    {
        this.isInDatabase = value;
    }
}
