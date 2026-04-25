import { faker } from '@faker-js/faker';

import type { PtuMove } from '../models/PtuMove';

export const createPtuMoveData = ({ name = faker.lorem.word(), basedOn }: {
    name?: string;
    basedOn?: string;
} = {}): PtuMove =>
    ({
        // TODO: Fill out more as-needed for tests
        name,
        basedOn,
        effects: faker.lorem.sentence(),
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
