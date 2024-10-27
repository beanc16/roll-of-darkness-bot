import { UUID } from 'node:crypto';
import dayjs from 'dayjs';

import { CompositeKeyRecord } from '../../../services/CompositeKeyRecord.js';
import { Timer } from '../../../services/Timer.js';
import { CounterController } from '../dal/CounterMongoController.js';
import counterSingleton from '../models/CounterSingleton.js';

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
    private static SECONDS_TO_DEBOUNCE = 3; // TODO: Reduce this timer after mongodb-controller won't close connections if a save is in-progress

    public static onUpsert(guid: UUID)
    {
        // Get debouncability before adding an event timestamp
        const shouldDebounce = !this.eventTimestamps.Has([
            guid,
            CounterEventType.Upsert
        ]);

        // Add event timestamp
        this.eventTimestamps.Upsert([guid, CounterEventType.Upsert], dayjs());

        // Only debounce if it isn't already debouncing
        if (shouldDebounce)
        {
            this.debounceEvent([guid, CounterEventType.Upsert]);
        }
    }

    // Infinitely debounce until enough time has passed for the given event
    private static async debounceEvent(key: [UUID, CounterEventType])
    {
        await Timer.wait({
            seconds: this.SECONDS_TO_DEBOUNCE / 3,
            callback: async () =>
            {
                const prevTimestamp = this.eventTimestamps.Get(key);
                const currentTimestamp = dayjs();

                const secondsPassed = currentTimestamp.diff(
                    prevTimestamp,
                    'seconds',
                    true
                );

                if (secondsPassed > this.SECONDS_TO_DEBOUNCE)
                {
                    await this.saveToDb(key[0]);
                    this.eventTimestamps.Clear(key);
                }
                else
                {
                    await this.debounceEvent(key);
                }
            },
        });
    }

    private static async saveToDb(guid: UUID)
    {
        const counterContainer = counterSingleton.get(guid);

        // Update
        if (counterContainer.hasBeenSavedToDatabase())
        {
            await CounterController.findOneAndUpdate(
                { guid },
                counterContainer.getCounter()
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
