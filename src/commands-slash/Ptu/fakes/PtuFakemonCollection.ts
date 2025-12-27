import { faker } from '@faker-js/faker';

import { PtuFakemonCollection, PtuFakemonStatus } from '../dal/models/PtuFakemonCollection';
import { createPtuPokemonCollectionData } from './PtuPokemonCollection';
import { ObjectId } from 'mongodb';
import { PtuPokemon } from '../types/pokemon';

const getFakeDiscordId = (): string =>
{
    // Discord user ids are 18 character numeric strings
    return faker.helpers.multiple(
        () => faker.number.int({ min: 0, max: 9 }),
        { count: 18 },
    ).map(element => element.toString()).join('');
};

const getFakeDiscordIds = (): string[] =>
{
    return faker.helpers.multiple(
        () => getFakeDiscordId(),
        { count: 10 },
    );
};

export const createPtuFakemonCollectionData = (): PtuFakemonCollection =>
{
    const pokemon = createPtuPokemonCollectionData();

    return {
        ...pokemon,
        _id: new ObjectId(faker.database.mongodbObjectId()),
        id: new ObjectId(faker.database.mongodbObjectId()),
        editors: faker.helpers.arrayElements(
            getFakeDiscordIds(),
            { min: 1, max: 2 },
        ),
        status: faker.helpers.arrayElement(Object.values(PtuFakemonStatus)),
        creationChannelId: getFakeDiscordId(),
        feedbacks: [],
        toPtuPokemon: () => ({} as unknown as PtuPokemon),
    };
};
