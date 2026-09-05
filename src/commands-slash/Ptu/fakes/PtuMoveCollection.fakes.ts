import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';

import {
    PtuCustomMoveArmorClass,
    PtuCustomMoveDamageBase,
    PtuCustomMoveFrequency,
    PtuCustomMoveRangeOptions,
    PtuMoveCollection,
    PtuMoveStatus,
} from '../dal/models/PtuMoveCollection.js';
import { getRandomKeywords } from './ptu.fakes.js';
import { createPtuMoveData } from './PtuMove.fakes.js';

export const createPtuMoveCollectionData = ({
    name,
}: {
    name?: string;
} = {}): PtuMoveCollection =>
{
    const id = new ObjectId(faker.database.mongodbObjectId());

    const move = createPtuMoveData({ name });

    return {
        _id: id,
        id,
        name: move.name,
        type: move.type,
        category: move.category,
        frequency: faker.helpers.arrayElements(
            Object.values(PtuCustomMoveFrequency),
            faker.number.int({ min: 1 }),
        )[0],
        damageBase: faker.helpers.arrayElements(
            Object.values(PtuCustomMoveDamageBase),
            faker.number.int({ min: 1 }),
        )[0] as PtuCustomMoveDamageBase,
        ac: faker.helpers.arrayElements(
            Object.values(PtuCustomMoveArmorClass),
            faker.number.int({ min: 1 }),
        )[0] as PtuCustomMoveArmorClass,
        keywords: getRandomKeywords(4) as [string, string, string, string],
        rangeOptions: faker.helpers.arrayElements(
            Object.values(PtuCustomMoveRangeOptions),
            faker.number.int({ min: 1, max: 4 }),
        ) as PtuCustomMoveRangeOptions[],
        effects: move.effects,
        contestStatEffect: move.contestStatEffect,
        contestStatType: move.contestStatType,
        basedOn: move.basedOn,
        status: faker.helpers.arrayElements(
            Object.values(PtuMoveStatus),
            faker.number.int({ min: 1 }),
        )[0],
        editorDiscordUserIds: Array.from(
            { length: faker.number.int({ min: 1, max: 2 }) },
            () => faker.string.uuid(),
        ),
    };
};
