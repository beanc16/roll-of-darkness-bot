import { UUID } from 'node:crypto';

import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import { CounterContainer } from '../dal/models/CounterContainer.js';
import { CounterOperation } from '../dal/types.js';

interface UpdateCountParameters
{
    guid: UUID;
    userId: string;
}

class CounterSingleton
{
    private singleton: RecordSingleton<UUID, CounterContainer>;

    constructor(params?: Record<UUID, CounterContainer>)
    {
        this.singleton = new RecordSingleton(params);
    }

    public getAll(): Record<UUID, CounterContainer>
    {
        return this.singleton.getAll();
    }

    public get(key: UUID): CounterContainer
    {
        return this.singleton.get(key);
    }

    public set(value: Record<UUID, CounterContainer>): void
    {
        this.singleton.set(value);
    }

    public upsert(value: CounterContainer): void
    {
        this.singleton.upsert(value.guid, value);
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
