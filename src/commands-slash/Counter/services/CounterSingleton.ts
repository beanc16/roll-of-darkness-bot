import { UUID } from 'node:crypto';

import Singleton from '../../../services/Singleton/Singleton.js';
import { CounterType } from '../../options/counter.js';
import { CounterContainer } from '../dal/models/CounterContainer.js';
import { CounterOperation } from '../dal/types.js';
import { CounterEventHandler } from './CounterEventHandler.js';

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

    public getAll(): Record<UUID, CounterContainer>
    {
        return this.singleton.get() ?? {};
    }

    public get(key: UUID): CounterContainer
    {
        return this.getAll()[key];
    }

    public set(value: Record<UUID, CounterContainer>): void
    {
        this.singleton.set(value);
    }

    public upsert(value: CounterContainer): void
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

    public incrementCount({ guid, userId }: UpdateCountParameters): void
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

    public decrementCount({ guid, userId }: UpdateCountParameters): void
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
