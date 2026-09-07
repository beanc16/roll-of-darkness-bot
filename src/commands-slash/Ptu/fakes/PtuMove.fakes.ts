import { faker } from '@faker-js/faker';

import type { PtuMove } from '../models/PtuMove.js';
import {
    getRandomArmorClass,
    getRandomCategory,
    getRandomContestStatEffect,
    getRandomContestStatType,
    getRandomDamageBase,
    getRandomFrequency,
    getRandomRange,
    getRandomTypes,
} from './ptu.fakes.js';

export const createPtuMoveData = ({ name = faker.lorem.word(), basedOn }: {
    name?: string;
    basedOn?: string;
} = {}): PtuMove =>
    ({
        name,
        type: getRandomTypes(1)[0],
        category: getRandomCategory(),
        frequency: getRandomFrequency(),
        damageBase: getRandomDamageBase(),
        ac: getRandomArmorClass(),
        range: getRandomRange(),
        effects: faker.lorem.sentence(),
        contestStatEffect: getRandomContestStatEffect(),
        contestStatType: getRandomContestStatType(),
        basedOn,
        uses: {
            sheerForce: false,
            toughClaws: false,
            technician: false,
            reckless: false,
            ironFist: false,
            megaLauncher: false,
            megaLauncherErrata: false,
            punkRock: false,
            strongJaw: false,
            recklessErrata: false,
        },
    }) as unknown as PtuMove;
