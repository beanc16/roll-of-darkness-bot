import { UUID } from 'node:crypto';

import Singleton from '../../../models/Singleton.js';
import { CounterContainer, CounterOperation } from '../dal/CounterMongoController.js';
import { CounterEventHandler } from '../services/CounterEventHandler.js';
import { CounterType } from '../../options/counter.js';

interface UpdateCountParameters
{
    guid: UUID;
    userId: string;
}

class CounterSingleton
{
    private singleton: Singleton<Record<UUID, CounterContainer>>;

    constructor(params?: Record<UUID, CounterContainer>)
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

    set(value: Record<UUID, CounterContainer>)
    {
        this.singleton.set(value);
    }

    upsert(value: CounterContainer)
    {
        const all = this.getAll();

        this.set({
            ...all,
            [value.guid]: value,
        });

        if (value.counterType === CounterType.Permanent)
        {
            CounterEventHandler.onUpsert(value.guid);
        }
    }

    incrementCount({
        guid,
        userId,
    }: UpdateCountParameters)
    {
        const counterContainer = this.get(guid);
        counterContainer.count += 1;
        counterContainer.addAuditLog({
            userId,
            operation: CounterOperation.Plus,
            timestamp: new Date(),
        });
        this.upsert(counterContainer);
    }

    decrementCount({
        guid,
        userId,
    }: UpdateCountParameters)
    {
        const counterContainer = this.get(guid);
        counterContainer.count -= 1;
        counterContainer.addAuditLog({
            userId,
            operation: CounterOperation.Minus,
            timestamp: new Date(),
        });
        this.upsert(counterContainer);
    }
}



export default new CounterSingleton();
