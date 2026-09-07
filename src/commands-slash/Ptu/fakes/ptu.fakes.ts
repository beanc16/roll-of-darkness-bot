import { faker } from '@faker-js/faker';

import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
    PtuMoveFrequency,
} from '../types/pokemon.js';

export const getRandomTypes = (numOfTypes: number): PokemonType[] =>
{
    return faker.helpers.arrayElements(
        Object.values(PokemonType),
        faker.number.int({ min: 1, max: numOfTypes }),
    );
};

export const getRandomCategory = (): PokemonMoveCategory =>
{
    return faker.helpers.arrayElements(
        Object.values(PokemonMoveCategory),
        faker.number.int({ min: 1 }),
    )[0];
};

export const getRandomFrequency = (): PtuMoveFrequency =>
{
    return faker.helpers.arrayElements(
        Object.values(PtuMoveFrequency),
        faker.number.int({ min: 1 }),
    )[0];
};

export const getRandomDamageBase = (): number =>
{
    return faker.number.int({ min: 1, max: 28 });
};

export const getRandomArmorClass = (): number =>
{
    return faker.number.int({ min: 1, max: 10 });
};

export const getRandomRange = (numOfKeywords = 4): string =>
{
    const numOfFakeRangeKeywords = faker.number.int({ min: 1, max: numOfKeywords });

    return Array.from(
        { length: numOfFakeRangeKeywords },
        () => faker.word.noun(),
    ).join(', ');
};

export const getRandomContestStatEffect = (): PtuContestStatEffect =>
{
    return faker.helpers.arrayElements(
        Object.values(PtuContestStatEffect),
        faker.number.int({ min: 1 }),
    )[0];
};

export const getRandomContestStatType = (): PtuContestStatType =>
{
    return faker.helpers.arrayElements(
        Object.values(PtuContestStatType),
        faker.number.int({ min: 1 }),
    )[0];
};

export const getRandomKeywords = (numOfKeywords = 4): string[] =>
{
    const numOfFakeRangeKeywords = faker.number.int({ min: 1, max: numOfKeywords });

    return Array.from(
        { length: numOfFakeRangeKeywords },
        () => faker.word.noun(),
    );
};
