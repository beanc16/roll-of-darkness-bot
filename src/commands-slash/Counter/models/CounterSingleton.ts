import { UUID } from 'node:crypto';

import Singleton from '../../../models/Singleton.js';
import { Counter, CounterOperation } from '../dal/CounterMongoController.js';

class CounterSingleton
{
    private singleton: Singleton<Record<UUID, Counter>>;

    constructor(params?: Record<UUID, Counter>)
    {
        this.singleton = new Singleton(params ?? {});
    }

    getAll()
    {
        return this.singleton.get() ?? {};
    }

    get(key: UUID)
    {
        return this.getAll()[key];
    }

    set(value: Record<UUID, Counter>)
    {
        this.singleton.set(value);
    }

    upsert(value: Counter)
    {
        const all = this.getAll();

        this.set({
            ...all,
            [value.guid]: value,
        });
    }

    incrementCount(key: UUID, userId: string)
    {
        const counter = this.get(key);
        counter.count += 1;
        counter.auditLogs.push({
            userId,
            operation: CounterOperation.Plus,
        });
        this.upsert(counter);
    }

    decrementCount(key: UUID, userId: string)
    {
        const counter = this.get(key);
        counter.count -= 1;
        counter.auditLogs.push({
            userId,
            operation: CounterOperation.Minus,
        });
        this.upsert(counter);
    }
}



export default new CounterSingleton();
