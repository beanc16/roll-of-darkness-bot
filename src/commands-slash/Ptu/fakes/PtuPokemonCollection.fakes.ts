import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';

import { PtuPokemonCollection } from '../dal/models/PtuPokemonCollection.js';
import {
    PokemonEggGroup,
    PokemonType,
    PtuHeight,
    PtuPokemon,
} from '../types/pokemon.js';

const getArrayOfWords = ({ min, max }: {
    min: number;
    max: number;
} | {
    min?: never;
    max: number;
}): string[] =>
{
    const options = faker.lorem.words(faker.number.int({ min: max, max })).split(' ');
    const numOfElements = (min) ? faker.number.int({ min, max }) : max;

    return faker.helpers.arrayElements(options, numOfElements);
};

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
    return `${dice}${sign}${modifier}`;
};

export const createPtuPokemonCollectionData = ({
    baseStats: {
        bst,
    } = {},
    capabilities: {
        numOfOtherCapabilities,
    } = {},
}: {
    baseStats?: {
        bst?: number;
    };
    capabilities?: {
        numOfOtherCapabilities?: number;
    };
} = {}): PtuPokemonCollection =>
{
    const id = new ObjectId(faker.database.mongodbObjectId());
    const speciesName = faker.person.firstName();

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
        types: getRandomTypes(2),
        baseStats,
        abilities: {
            basicAbilities: getArrayOfWords({ max: numOf.basicAbilities }),
            advancedAbilities: getArrayOfWords({ max: numOf.advancedAbilities }),
            highAbility: faker.lorem.word(),
        },
        evolution: [
            {
                name: speciesName, level: 1, stage: 1,
            },
            {
                name: faker.person.firstName(), level: 20, stage: 2,
            },
            {
                name: faker.person.firstName(), level: 40, stage: 3,
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
        breedingInformation: {
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
        diets: getArrayOfWords({ min: 1, max: 3 }),
        habitats: getArrayOfWords({ min: 1, max: 4 }),
        skills: {
            athletics: getFakeSkill(),
            acrobatics: getFakeSkill(),
            combat: getFakeSkill(),
            focus: getFakeSkill(),
            perception: getFakeSkill(),
            stealth: getFakeSkill(),
        },
        moveList: {
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
        megaEvolutions: faker.helpers.maybe(() => ([{
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
        extras: faker.helpers.maybe(() => [{
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
