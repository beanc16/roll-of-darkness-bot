/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';

import { getFakeDiscordId, getFakeDiscordIds } from '../../../fakes/discord/ids.js';
import {
    PtuFakemonCollection,
    PtuFakemonDexType,
    PtuFakemonRegionType,
    PtuFakemonStatus,
} from '../dal/models/PtuFakemonCollection';
import { PtuPokemonCollection } from '../dal/models/PtuPokemonCollection';
import { PtuPokemon } from '../types/pokemon';
import { createPtuPokemonCollectionData } from './PtuPokemonCollection.fakes';

export const createPtuFakemonCollectionData = (
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- This is incorrectly believing this is of type any
    args: Parameters<typeof createPtuPokemonCollectionData>[0] & {
        dexType?: PtuFakemonRegionType;
        dexNumber?: string | null;
        editName?: string;
    } = {},
): PtuFakemonCollection =>
{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const pokemon = createPtuPokemonCollectionData(args);

    if (args.dexNumber === null)
    {
        pokemon.metadata.dexNumber = undefined;
    }
    else if (args.dexNumber !== undefined)
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        pokemon.metadata.dexNumber = args.dexNumber;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...pokemon,
        _id: new ObjectId(faker.database.mongodbObjectId()),
        id: new ObjectId(faker.database.mongodbObjectId()),
        editors: faker.helpers.arrayElements(
            getFakeDiscordIds(),
            { min: 1, max: 2 },
        ),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        status: faker.helpers.arrayElement(Object.values(PtuFakemonStatus)),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        dexType: args?.dexType ?? faker.helpers.arrayElement([
            PtuFakemonDexType.Eden,
            PtuFakemonDexType.Meridia,
            PtuFakemonDexType.Magalam,
            PtuFakemonDexType.Distira,
        ]),
        creationChannelId: getFakeDiscordId(),
        feedbacks: [],
        transferredTo: {
            googleSheets: {
                pokemonData: false,
                pokemonSkills: false,
            },
            ptuDatabase: false,
            imageStorage: false,
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        toPtuPokemon: () => ({} as PtuPokemon),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        editName: args?.editName,
    };
};

export const createPtuFakemonAndPokemonCollectionData = (
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- This is incorrectly believing this is of type any
    args: Parameters<typeof createPtuPokemonCollectionData>[0] & {
        dexType?: PtuFakemonRegionType;
        editName?: string;
    } = {},
): { pokemon: PtuPokemonCollection; fakemon: PtuFakemonCollection } =>
{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const pokemon = createPtuPokemonCollectionData(args);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pokemon,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        fakemon: {
            ...pokemon,
            _id: new ObjectId(faker.database.mongodbObjectId()),
            id: new ObjectId(faker.database.mongodbObjectId()),
            editors: faker.helpers.arrayElements(
                getFakeDiscordIds(),
                { min: 1, max: 2 },
            ),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            status: faker.helpers.arrayElement(Object.values(PtuFakemonStatus)),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            dexType: args?.dexType ?? faker.helpers.arrayElement([
                PtuFakemonDexType.Eden,
                PtuFakemonDexType.Meridia,
                PtuFakemonDexType.Magalam,
                PtuFakemonDexType.Distira,
            ]),
            creationChannelId: getFakeDiscordId(),
            feedbacks: [],
            transferredTo: {
                googleSheets: {
                    pokemonData: false,
                    pokemonSkills: false,
                },
                ptuDatabase: false,
                imageStorage: false,
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            toPtuPokemon: () => ({} as PtuPokemon),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            editName: args?.editName,
        },
    };
};
