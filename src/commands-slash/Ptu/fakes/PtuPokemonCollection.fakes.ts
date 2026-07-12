import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';

import { getArrayOfWords } from '../../../fakes/arrays.js';
import { PtuPokemonCollection } from '../dal/models/PtuPokemonCollection.js';
import {
    PokemonDiet,
    PokemonEggGroup,
    PokemonHabitat,
    PokemonType,
    PtuHeight,
    PtuPokemon,
} from '../types/pokemon.js';

const getRandomTypes = (numOfTypes: number): string[] =>
{
    return faker.helpers.arrayElements(
        Object.values(PokemonType),
        faker.number.int({ min: 1, max: numOfTypes }),
    );
};

const getFakeSkill = (): string =>
{
    const dice = faker.number.int({ min: 1, max: 6 });
    const modifier = faker.number.int({ min: -3, max: 6 });
    const sign = (modifier >= 0) ? '+' : '';
    return `${dice}d6${sign}${modifier}`;
};

export const createPtuPokemonCollectionData = ({
    abilities,
    baseStats: {
        bst,
    } = {},
    breedingInformation,
    capabilities: {
        numOfOtherCapabilities,
    } = {},
    diets,
    extras,
    evolution,
    habitats,
    megaEvolutions,
    moveList,
    name,
    types,
}: {
    abilities?: PtuPokemonCollection['abilities'];
    baseStats?: {
        bst?: number;
    };
    breedingInformation?: PtuPokemon['breedingInformation'];
    capabilities?: {
        numOfOtherCapabilities?: number;
    };
    diets?: PokemonDiet[];
    extras?: PtuPokemon['extras'];
    evolution?: PtuPokemon['evolution'];
    habitats?: PokemonHabitat[];
    megaEvolutions?: PtuPokemon['megaEvolutions'];
    moveList?: PtuPokemon['moveList'];
    name?: string;
    types?: PokemonType[];
} = {}): PtuPokemonCollection =>
{
    const uniqueFirstNames = faker.helpers.uniqueArray(faker.person.firstName, 3);
    const id = new ObjectId(faker.database.mongodbObjectId());
    const speciesName = name ?? uniqueFirstNames[0];

    const numOf = faker.helpers.arrayElement([
        { basicAbilities: 2, advancedAbilities: 2 },
        { basicAbilities: 1, advancedAbilities: 3 },
    ]);

    const nonSpeedStat = bst !== undefined ? Math.round(bst / 6) : undefined;
    const speed = bst !== undefined ? bst - (nonSpeedStat! * 5) : undefined;
    const baseStats = bst === undefined
        ? {
            hp: faker.number.int({ min: 1, max: 15 }),
            attack: faker.number.int({ min: 1, max: 15 }),
            defense: faker.number.int({ min: 1, max: 15 }),
            specialAttack: faker.number.int({ min: 1, max: 15 }),
            specialDefense: faker.number.int({ min: 1, max: 15 }),
            speed: faker.number.int({ min: 1, max: 15 }),
        }
        : {
            hp: nonSpeedStat!,
            attack: nonSpeedStat!,
            defense: nonSpeedStat!,
            specialAttack: nonSpeedStat!,
            specialDefense: nonSpeedStat!,
            speed: speed!,
        };

    return {
        _id: id,
        name: speciesName,
        types: types ?? getRandomTypes(2),
        baseStats,
        abilities: abilities ?? {
            basicAbilities: getArrayOfWords({ max: numOf.basicAbilities }),
            advancedAbilities: getArrayOfWords({ max: numOf.advancedAbilities }),
            highAbility: faker.lorem.word(),
        },
        evolution: evolution ?? [
            {
                name: speciesName, level: 1, stage: 1,
            },
            {
                name: uniqueFirstNames[1], level: 20, stage: 2,
            },
            {
                name: uniqueFirstNames[2], level: 40, stage: 3,
            },
        ],
        capabilities: {
            overland: faker.number.int({ min: 1, max: 8 }),
            swim: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 8 })),
            sky: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 8 })),
            levitate: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 8 })),
            burrow: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 8 })),
            highJump: faker.number.int({ min: 1, max: 3 }),
            lowJump: faker.number.int({ min: 1, max: 3 }),
            power: faker.number.int({ min: 1, max: 8 }),
            other: numOfOtherCapabilities === undefined
                ? faker.helpers.maybe(() => getArrayOfWords({ min: 0, max: 9 }))
                : getArrayOfWords({ min: numOfOtherCapabilities, max: numOfOtherCapabilities }),
        },
        sizeInformation: {
            height: {
                freedom: `${faker.number.int({ min: 1, max: 8 })}'${faker.number.int({ min: 1, max: 8 })}"`,
                metric: `${faker.number.float({
                    min: 1, max: 8, fractionDigits: 1,
                })}m`,
                ptu: faker.helpers.arrayElement(Object.values(PtuHeight)),
            },
            weight: {
                freedom: `${faker.number.float({
                    min: 1, max: 8, fractionDigits: 1,
                })}lb`,
                metric: `${faker.number.float({
                    min: 1, max: 8, fractionDigits: 1,
                })}kg`,
                ptu: faker.number.int({ min: 1, max: 6 }),
            },
        },
        breedingInformation: breedingInformation ?? {
            genderRatio: faker.helpers.arrayElement([
                { male: 50, female: 50 },
                { male: 75, female: 25 },
                { male: 25, female: 75 },
                { male: 100, female: 0 },
                { male: 0, female: 100 },
                { none: true },
            ]),
            eggGroups: faker.helpers.arrayElements(
                Object.values(PokemonEggGroup),
                faker.number.int({ min: 1, max: 2 }),
            ),
            averageHatchRate: `${faker.number.int({ min: 1, max: 75 })} Days`,
        },
        diets: diets ?? faker.helpers.arrayElements(
            Object.values(PokemonDiet),
            faker.number.int({ min: 1, max: 2 }),
        ),
        habitats: habitats ?? faker.helpers.arrayElements(
            Object.values(PokemonHabitat),
            faker.number.int({ min: 1, max: 5 }),
        ),
        skills: {
            athletics: getFakeSkill(),
            acrobatics: getFakeSkill(),
            combat: getFakeSkill(),
            focus: getFakeSkill(),
            perception: getFakeSkill(),
            stealth: getFakeSkill(),
        },
        moveList: moveList ?? {
            levelUp: getArrayOfWords({ min: 10, max: 15 }).map((word, index) => ({
                move: word,
                level: 1 * (index + 1),
                type: getRandomTypes(1)[0],
            })),
            tmHm: getArrayOfWords({ min: 0, max: 40 }),
            eggMoves: getArrayOfWords({ min: 0, max: 40 }),
            tutorMoves: getArrayOfWords({ min: 0, max: 40 }),
            zygardeCubeMoves: faker.helpers.maybe(() => getArrayOfWords({ min: 0, max: 5 }), { probability: 0.05 }),
        },
        megaEvolutions: megaEvolutions ?? faker.helpers.maybe(() => ([{
            name: `Mega ${speciesName}`,
            types: faker.helpers.maybe(() => getRandomTypes(2)) || [],
            ability: faker.lorem.word(),
            stats: faker.helpers.arrayElement([
                {},
                {
                    defense: '+2', specialAttack: '+4', speed: '+3',
                },
                {
                    attack: '+4', defense: '+3', specialAttack: '+4', specialDefense: '+2', speed: '-3',
                },
                {
                    attack: '+2', defense: '+4', specialDefense: '+3',
                },
                {
                    defense: '+4', specialAttack: '+3', specialDefense: '+1', speed: '+2',
                },
                {
                    attack: '+4', defense: '+3', specialDefense: '+3',
                },
            ]),
        }]), { probability: 0.1 }),
        metadata: {
            source: faker.lorem.word(),
            dexNumber: faker.helpers.maybe(() => `#${faker.number.int({ min: 1, max: 1000 })}`),
            page: faker.helpers.maybe(() => `p.${faker.number.int({ min: 1, max: 1000 })}`),
            imageUrl: faker.helpers.maybe(() => faker.image.url()),
        },
        extras: extras ?? faker.helpers.maybe(() => [{
            name: faker.lorem.words({ min: 1, max: 2 }),
            value: faker.lorem.sentences({ min: 1, max: 3 }),
        }], { probability: 0.05 }),
        edits: faker.helpers.maybe(() => ([{
            editName: faker.lorem.words({ min: 1, max: 5 }),
            moveList: {
                tmHm: getArrayOfWords({ min: 0, max: 40 }),
            } as unknown as PtuPokemonCollection['moveList'],
        }])),
        toPtuPokemon: () => ({} as PtuPokemon),
    };
};
