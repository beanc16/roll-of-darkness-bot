import { UUID } from 'node:crypto';

import dayjs from 'dayjs';

import { CompositeKeyRecord } from '../../../services/CompositeKeyRecord.js';
import { Timer } from '../../../services/Timer.js';
import { CounterController } from '../dal/CounterMongoController.js';
import counterSingleton from './CounterSingleton.js';

enum CounterEventType
{
    Upsert = 'upsert',
}

export class CounterEventHandler
{
    private static eventTimestamps: CompositeKeyRecord<
        [UUID, CounterEventType],
        dayjs.Dayjs
    > = new CompositeKeyRecord();

    private static SECONDS_TO_DEBOUNCE = 4; // TODO: Reduce this timer after mongodb-controller won't close connections if a save is in-progress

    public static onUpsert(guid: UUID): void
    {
        // Get debouncability before adding an event timestamp
        const shouldDebounce = !this.eventTimestamps.Has([
            guid,
            CounterEventType.Upsert,
        ]);

        // Add event timestamp
        this.eventTimestamps.Upsert([guid, CounterEventType.Upsert], dayjs());

        // Only debounce if it isn't already debouncing
        if (shouldDebounce)
        {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            this.debounceEvent([guid, CounterEventType.Upsert]);
        }
    }

    // Infinitely debounce until enough time has passed for the given event
    private static async debounceEvent(key: [UUID, CounterEventType]): Promise<void>
    {
        await Timer.waitUntilTrue({
            seconds: this.SECONDS_TO_DEBOUNCE / 3,
            callback: () =>
            {
                const prevTimestamp = this.eventTimestamps.Get(key);
                const currentTimestamp = dayjs();

                const secondsPassed = currentTimestamp.diff(
                    prevTimestamp,
                    'seconds',
                    true,
                );

                return secondsPassed > this.SECONDS_TO_DEBOUNCE;
            },
        });

        await this.saveToDb(key[0]);
        this.eventTimestamps.Clear(key);
    }

    private static async saveToDb(guid: UUID): Promise<void>
    {
        const counterContainer = counterSingleton.get(guid);

        // Update
        if (counterContainer.hasBeenSavedToDatabase())
        {
            await CounterController.findOneAndUpdate(
                { guid },
                counterContainer.getCounter(),
            );
        }

        // Insert
        else
        {
            await CounterController.insertOne(counterContainer.getCounter());
            counterContainer.setHasBeenSavedToDatabase(true);
            counterSingleton.upsert(counterContainer);
        }
    }
}
