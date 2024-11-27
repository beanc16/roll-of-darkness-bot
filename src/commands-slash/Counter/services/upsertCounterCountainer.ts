import { UUID } from 'node:crypto';

import { CounterType } from '../../options/counter.js';
import { CounterContainer } from '../dal/models/CounterContainer.js';
import { CounterEventHandler } from './CounterEventHandler.js';
import counterSingleton from './CounterSingleton.js';

export function upsertCounterCountainerWithDbUpdate(container: CounterContainer): void;
export function upsertCounterCountainerWithDbUpdate(guid: UUID): void;
export function upsertCounterCountainerWithDbUpdate(input: CounterContainer | UUID): void
{
    const container = (input instanceof CounterContainer)
        ? input
        : counterSingleton.get(input);

    counterSingleton.upsert(container);

    if (container.counterType === CounterType.Permanent)
    {
        CounterEventHandler.onUpsert(container.guid);
    }
};
