/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import {
    PokemonEggGroup,
    PokemonType,
    PtuHeight,
    PtuNaturewalk,
} from '../../../../../types/pokemon.js';
import { FakemonToGoogleSheetsAdapter } from '../FakemonToGoogleSheetsAdapter.js';

describe(`class: ${FakemonToGoogleSheetsAdapter.name}`, () =>
{
    let adapter: FakemonToGoogleSheetsAdapter;

    // pokemonData indices
    const POKEMON_DATA_INDEX = {
        NAME: 0,
        HP: 1,
        ATTACK: 2,
        DEFENSE: 3,
        SPECIAL_ATTACK: 4,
        SPECIAL_DEFENSE: 5,
        SPEED: 6,
        TYPE_1_LABEL: 7,
        TYPE_2_LABEL: 8,
        OVERLAND: 9,
        SKY: 10,
        SWIM: 11,
        LEVITATE: 12,
        BURROW: 13,
        HIGH_JUMP: 14,
        LOW_JUMP: 15,
        POWER: 16,
        NATUREWALK: 17,
        OTHER_CAPABILITY_1: 18,
        OTHER_CAPABILITY_2: 19,
        OTHER_CAPABILITY_3: 20,
        OTHER_CAPABILITY_4: 21,
        OTHER_CAPABILITY_5: 22,
        OTHER_CAPABILITY_6: 23,
        OTHER_CAPABILITY_7: 24,
        OTHER_CAPABILITY_8: 25,
        OTHER_CAPABILITY_9: 26,
        HEIGHT: 27,
        WEIGHT: 28,
        EGG_GROUP_1: 29,
        EGG_GROUP_2: 30,
        TYPE_1: 31,
        TYPE_2: 32,
    };

    // pokemonSkills indices
    const POKEMON_SKILLS_INDEX = {
        POKEMON_NAME: 0,
        ACROBATICS_DICE: 1,
        ACROBATICS_MODIFIER: 2,
        ATHLETICS_DICE: 3,
        ATHLETICS_MODIFIER: 4,
        CHARM_DICE: 5,
        CHARM_MODIFIER: 6,
        COMBAT_DICE: 7,
        COMBAT_MODIFIER: 8,
        COMMAND_DICE: 9,
        COMMAND_MODIFIER: 10,
        GENERAL_EDUCATION_DICE: 11,
        GENERAL_EDUCATION_MODIFIER: 12,
        MEDICAL_EDUCATION_DICE: 13,
        MEDICAL_EDUCATION_MODIFIER: 14,
        OCCULT_EDUCATION_DICE: 15,
        OCCULT_EDUCATION_MODIFIER: 16,
        POKEMON_EDUCATION_DICE: 17,
        POKEMON_EDUCATION_MODIFIER: 18,
        TECHNOLOGY_EDUCATION_DICE: 19,
        TECHNOLOGY_EDUCATION_MODIFIER: 20,
        FOCUS_DICE: 21,
        FOCUS_MODIFIER: 22,
        GUILE_DICE: 23,
        GUILE_MODIFIER: 24,
        INTIMIDATE_DICE: 25,
        INTIMIDATE_MODIFIER: 26,
        INTUITION_DICE: 27,
        INTUITION_MODIFIER: 28,
        PERCEPTION_DICE: 29,
        PERCEPTION_MODIFIER: 30,
        STEALTH_DICE: 31,
        STEALTH_MODIFIER: 32,
        SURVIVAL_DICE: 33,
        SURVIVAL_MODIFIER: 34,
    };

    beforeEach(() =>
    {
        jest.clearAllMocks();
        adapter = new FakemonToGoogleSheetsAdapter();
    });

    describe(`method: ${FakemonToGoogleSheetsAdapter.prototype.transform.name}`, () =>
    {
        it('should transform PtuFakemonCollection to FakemonGoogleSheetsData with pokemonData and pokemonSkills arrays', () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({
                dexType: PtuFakemonDexType.Eden,
            });

            // Act
            const result = adapter.transform(fakemon);

            // Assert
            expect(result).toEqual({
                pokemonData: expect.any(Array),
                pokemonSkills: expect.any(Array),
            });
        });

        describe('pokemonData', () =>
        {
            it('should transform PtuFakemonCollection to complete pokemonData array', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 5,
                    },
                });
                fakemon.capabilities.other = [
                    fakemon.capabilities.other![0],
                    fakemon.capabilities.other![1],
                    fakemon.capabilities.other![2],
                    `Naturewalk (${PtuNaturewalk.Beach})`,
                    fakemon.capabilities.other![3],
                    fakemon.capabilities.other![4],
                ];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData).toEqual([
                    fakemon.name,
                    // Stats
                    fakemon.baseStats.hp.toString(),
                    fakemon.baseStats.attack.toString(),
                    fakemon.baseStats.defense.toString(),
                    fakemon.baseStats.specialAttack.toString(),
                    fakemon.baseStats.specialDefense.toString(),
                    fakemon.baseStats.speed.toString(),
                    // Type 1 & 2 label (blank fill)
                    '',
                    '',
                    // Movement capabilities
                    fakemon.capabilities.overland.toString(),
                    fakemon.capabilities.sky?.toString() ?? '',
                    fakemon.capabilities.swim?.toString() ?? '',
                    fakemon.capabilities.levitate?.toString() ?? '',
                    fakemon.capabilities.burrow?.toString() ?? '',
                    fakemon.capabilities.highJump.toString(),
                    fakemon.capabilities.lowJump.toString(),
                    fakemon.capabilities.power.toString(),
                    // Naturewalk
                    PtuNaturewalk.Beach,
                    // 1-9 non-naturewalk other capabilities
                    fakemon.capabilities.other![0],
                    fakemon.capabilities.other![1],
                    fakemon.capabilities.other![2],
                    fakemon.capabilities.other![4],
                    fakemon.capabilities.other![5],
                    '-',
                    '-',
                    '-',
                    '-',
                    // Size & Weight
                    fakemon.sizeInformation.height.ptu.toString(),
                    fakemon.sizeInformation.weight.ptu.toString(),
                    // Egg Groups
                    fakemon.breedingInformation.eggGroups[0],
                    fakemon.breedingInformation.eggGroups[1] ?? '-',
                    // Types
                    fakemon.types[0],
                    fakemon.types[1] ?? 'None',
                ]);
            });

            it('should transform name correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.name = 'Test Pokemon Name';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.NAME]).toBe('Test Pokemon Name');
            });

            it('should transform HP stat correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.baseStats.hp = 10;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.HP]).toBe('10');
            });

            it('should transform Attack stat correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.baseStats.attack = 8;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.ATTACK]).toBe('8');
            });

            it('should transform Defense stat correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.baseStats.defense = 7;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.DEFENSE]).toBe('7');
            });

            it('should transform Special Attack stat correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.baseStats.specialAttack = 12;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.SPECIAL_ATTACK]).toBe('12');
            });

            it('should transform Special Defense stat correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.baseStats.specialDefense = 9;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.SPECIAL_DEFENSE]).toBe('9');
            });

            it('should transform Speed stat correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.baseStats.speed = 11;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.SPEED]).toBe('11');
            });

            it('should set Type 1 label to empty string', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.TYPE_1_LABEL]).toBe('');
            });

            it('should set Type 2 label to empty string', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.TYPE_2_LABEL]).toBe('');
            });

            it('should transform overland capability correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.overland = 8;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OVERLAND]).toBe('8');
            });

            it('should transform sky capability correctly when defined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.sky = 5;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.SKY]).toBe('5');
            });

            it('should transform sky capability to empty string when undefined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.sky = undefined;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.SKY]).toBe('');
            });

            it('should transform swim capability correctly when defined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.swim = 6;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.SWIM]).toBe('6');
            });

            it('should transform swim capability to empty string when undefined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.swim = undefined;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.SWIM]).toBe('');
            });

            it('should transform levitate capability correctly when defined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.levitate = 4;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.LEVITATE]).toBe('4');
            });

            it('should transform levitate capability to empty string when undefined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.levitate = undefined;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.LEVITATE]).toBe('');
            });

            it('should transform burrow capability correctly when defined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.burrow = 3;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.BURROW]).toBe('3');
            });

            it('should transform burrow capability to empty string when undefined', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.burrow = undefined;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.BURROW]).toBe('');
            });

            it('should transform highJump capability correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.highJump = 5;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.HIGH_JUMP]).toBe('5');
            });

            it('should transform lowJump capability correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.lowJump = 2;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.LOW_JUMP]).toBe('2');
            });

            it('should transform power capability correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.capabilities.power = 7;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.POWER]).toBe('7');
            });

            it('should use hyphen for naturewalk when no naturewalk exists', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 3,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.NATUREWALK]).toBe('-');
            });

            it('should handle single naturewalk value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 3,
                    },
                });
                fakemon.capabilities.other = [
                    fakemon.capabilities.other![0],
                    `Naturewalk (${PtuNaturewalk.Forest})`,
                    fakemon.capabilities.other![1],
                ];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.NATUREWALK]).toBe(PtuNaturewalk.Forest);
            });

            it('should handle two naturewalk values', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 3,
                    },
                });
                fakemon.capabilities.other = [
                    fakemon.capabilities.other![0],
                    `Naturewalk (${PtuNaturewalk.Beach}, ${PtuNaturewalk.Cave})`,
                    fakemon.capabilities.other![1],
                ];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.NATUREWALK]).toBe(`${PtuNaturewalk.Beach}, ${PtuNaturewalk.Cave}`);
            });

            it('should handle three naturewalk values', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 3,
                    },
                });
                fakemon.capabilities.other = [
                    fakemon.capabilities.other![0],
                    `Naturewalk (${PtuNaturewalk.Beach}, ${PtuNaturewalk.Cave}, ${PtuNaturewalk.Desert})`,
                    fakemon.capabilities.other![1],
                ];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.NATUREWALK]).toBe(`${PtuNaturewalk.Beach}, ${PtuNaturewalk.Cave}, ${PtuNaturewalk.Desert}`);
            });

            it('should transform other capability 1 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 1,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_1]).toBe(fakemon.capabilities.other![0]);
            });

            it('should transform other capability 2 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 2,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_2]).toBe(fakemon.capabilities.other![1]);
            });

            it('should transform other capability 3 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 3,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_3]).toBe(fakemon.capabilities.other![2]);
            });

            it('should transform other capability 4 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 4,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_4]).toBe(fakemon.capabilities.other![3]);
            });

            it('should transform other capability 5 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 5,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_5]).toBe(fakemon.capabilities.other![4]);
            });

            it('should transform other capability 6 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 6,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_6]).toBe(fakemon.capabilities.other![5]);
            });

            it('should transform other capability 7 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 7,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_7]).toBe(fakemon.capabilities.other![6]);
            });

            it('should transform other capability 8 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 8,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_8]).toBe(fakemon.capabilities.other![7]);
            });

            it('should transform other capability 9 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 9,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_9]).toBe(fakemon.capabilities.other![8]);
            });

            it('should use hyphen for missing other capabilities', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                    capabilities: {
                        numOfOtherCapabilities: 2,
                    },
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_1]).not.toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_2]).not.toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_3]).toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_4]).toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_5]).toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_6]).toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_7]).toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_8]).toBe('-');
                expect(result.pokemonData[POKEMON_DATA_INDEX.OTHER_CAPABILITY_9]).toBe('-');
            });

            it('should transform height correctly', () =>
            {
                // Arrange
                const height = PtuHeight.Small;
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.sizeInformation.height.ptu = height;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.HEIGHT]).toBe(height);
            });

            it('should transform weight correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.sizeInformation.weight.ptu = 250;

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.WEIGHT]).toBe('250');
            });

            it('should transform egg group 1 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.breedingInformation.eggGroups = [
                    PokemonEggGroup.Monster,
                    PokemonEggGroup.Dragon,
                ];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.EGG_GROUP_1]).toBe(PokemonEggGroup.Monster);
            });

            it('should transform egg group 2 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.breedingInformation.eggGroups = [
                    PokemonEggGroup.Monster,
                    PokemonEggGroup.Dragon,
                ];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.EGG_GROUP_2]).toBe(PokemonEggGroup.Dragon);
            });

            it('should use hyphen for missing egg group 1 when egg groups array is empty', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.breedingInformation.eggGroups = [];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.EGG_GROUP_1]).toBe('-');
            });

            it('should use hyphen for missing egg group 2', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.breedingInformation.eggGroups = ['Field'];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.EGG_GROUP_1]).toBe('Field');
                expect(result.pokemonData[POKEMON_DATA_INDEX.EGG_GROUP_2]).toBe('-');
            });

            it('should transform type 1 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.types = [PokemonType.Fire, PokemonType.Flying];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.TYPE_1]).toBe(PokemonType.Fire);
            });

            it('should transform type 2 correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.types = [PokemonType.Fire, PokemonType.Flying];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.TYPE_2]).toBe(PokemonType.Flying);
            });

            it('should use "None" for missing type 1 when types array is empty', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.types = [];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.TYPE_1]).toBe('None');
            });

            it('should use "None" for missing type 2', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.types = [PokemonType.Fire];

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.TYPE_1]).toBe(PokemonType.Fire);
                expect(result.pokemonData[POKEMON_DATA_INDEX.TYPE_2]).toBe('None');
            });

            it('should trim all values in pokemonData', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.name = '  Trimmed Name  ';

                // Act
                const result = adapter.transform(fakemon);
                // Assert
                expect(result.pokemonData[POKEMON_DATA_INDEX.NAME]).toBe('Trimmed Name');
            });
        });

        describe('pokemonSkills', () =>
        {
            it('should transform PtuFakemonCollection to complete pokemonSkills array', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills = {
                    acrobatics: '1d6+1',
                    athletics: '1d6+1',
                    combat: '1d6+1',
                    focus: '1d6+1',
                    perception: '1d6+1',
                    stealth: '1d6+1',
                };

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills).toEqual([
                    // Name
                    fakemon.name,
                    // Acrobatics
                    '1',
                    `'+1`,
                    // Athletics
                    '1',
                    `'+1`,
                    // Charm
                    '2',
                    `'+0`,
                    // Combat
                    '1',
                    `'+1`,
                    // Command
                    '2',
                    `'+0`,
                    // General Education
                    '2',
                    `'+0`,
                    // Medical Education
                    '2',
                    `'+0`,
                    // Occult Education
                    '2',
                    `'+0`,
                    // Pokemon Education
                    '2',
                    `'+0`,
                    // Technology Education
                    '2',
                    `'+0`,
                    // Focus
                    '1',
                    `'+1`,
                    // Guile
                    '2',
                    `'+0`,
                    // Intimidate
                    '2',
                    `'+0`,
                    // Intuition
                    '2',
                    `'+0`,
                    // Perception
                    '1',
                    `'+1`,
                    // Stealth
                    '1',
                    `'+1`,
                    // Survival
                    '2',
                    `'+0`,
                ]);
            });

            it('should transform fakemon name correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.POKEMON_NAME]).toBe(fakemon.name);
            });

            it('should transform acrobatics dice correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.acrobatics = '4d6+2';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.ACROBATICS_DICE]).toBe('4');
            });

            it('should transform acrobatics modifier correctly with positive value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.acrobatics = '4d6+3';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.ACROBATICS_MODIFIER]).toBe(`'+3`);
            });

            it('should transform acrobatics modifier correctly with negative value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.acrobatics = '3d6-2';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.ACROBATICS_MODIFIER]).toBe(`'-2`);
            });

            it('should transform acrobatics modifier correctly with zero value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.acrobatics = '3d6+0';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.ACROBATICS_MODIFIER]).toBe(`'+0`);
            });

            it('should transform athletics dice correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.athletics = '5d6+1';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.ATHLETICS_DICE]).toBe('5');
            });

            it('should transform athletics modifier correctly with positive value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.athletics = '5d6+4';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.ATHLETICS_MODIFIER]).toBe(`'+4`);
            });

            it('should transform athletics modifier correctly with negative value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.athletics = '2d6-1';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.ATHLETICS_MODIFIER]).toBe(`'-1`);
            });

            it('should transform combat dice correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.combat = '6d6+2';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.COMBAT_DICE]).toBe('6');
            });

            it('should transform combat modifier correctly with positive value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.combat = '6d6+5';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.COMBAT_MODIFIER]).toBe(`'+5`);
            });

            it('should transform combat modifier correctly with negative value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.combat = '4d6-3';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.COMBAT_MODIFIER]).toBe(`'-3`);
            });

            it('should transform focus dice correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.focus = '3d6+1';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.FOCUS_DICE]).toBe('3');
            });

            it('should transform focus modifier correctly with positive value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.focus = '3d6+2';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.FOCUS_MODIFIER]).toBe(`'+2`);
            });

            it('should transform focus modifier correctly with negative value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.focus = '1d6-1';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.FOCUS_MODIFIER]).toBe(`'-1`);
            });

            it('should transform perception dice correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.perception = '4d6+3';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.PERCEPTION_DICE]).toBe('4');
            });

            it('should transform perception modifier correctly with positive value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.perception = '4d6+6';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.PERCEPTION_MODIFIER]).toBe(`'+6`);
            });

            it('should transform perception modifier correctly with negative value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.perception = '5d6-4';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.PERCEPTION_MODIFIER]).toBe(`'-4`);
            });

            it('should transform stealth dice correctly', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.stealth = '5d6+2';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.STEALTH_DICE]).toBe('5');
            });

            it('should transform stealth modifier correctly with positive value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.stealth = '5d6+4';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.STEALTH_MODIFIER]).toBe(`'+4`);
            });

            it('should transform stealth modifier correctly with negative value', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.stealth = '6d6-5';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.STEALTH_MODIFIER]).toBe(`'-5`);
            });

            it.each([
                ['charm', POKEMON_SKILLS_INDEX.CHARM_DICE],
                ['command', POKEMON_SKILLS_INDEX.COMMAND_DICE],
                ['general education', POKEMON_SKILLS_INDEX.GENERAL_EDUCATION_DICE],
                ['medical education', POKEMON_SKILLS_INDEX.MEDICAL_EDUCATION_DICE],
                ['occult education', POKEMON_SKILLS_INDEX.OCCULT_EDUCATION_DICE],
                ['pokemon education', POKEMON_SKILLS_INDEX.POKEMON_EDUCATION_DICE],
                ['technology education', POKEMON_SKILLS_INDEX.TECHNOLOGY_EDUCATION_DICE],
                ['guile', POKEMON_SKILLS_INDEX.GUILE_DICE],
                ['intimidate', POKEMON_SKILLS_INDEX.INTIMIDATE_DICE],
                ['intuition', POKEMON_SKILLS_INDEX.INTUITION_DICE],
                ['survival', POKEMON_SKILLS_INDEX.SURVIVAL_DICE],
            ])('should set %s dice to default value', (_, index) =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[index]).toBe('2');
            });

            it.each([
                ['charm', POKEMON_SKILLS_INDEX.CHARM_MODIFIER],
                ['command', POKEMON_SKILLS_INDEX.COMMAND_MODIFIER],
                ['general education', POKEMON_SKILLS_INDEX.GENERAL_EDUCATION_MODIFIER],
                ['medical education', POKEMON_SKILLS_INDEX.MEDICAL_EDUCATION_MODIFIER],
                ['occult education', POKEMON_SKILLS_INDEX.OCCULT_EDUCATION_MODIFIER],
                ['pokemon education', POKEMON_SKILLS_INDEX.POKEMON_EDUCATION_MODIFIER],
                ['technology education', POKEMON_SKILLS_INDEX.TECHNOLOGY_EDUCATION_MODIFIER],
                ['guile', POKEMON_SKILLS_INDEX.GUILE_MODIFIER],
                ['intimidate', POKEMON_SKILLS_INDEX.INTIMIDATE_MODIFIER],
                ['intuition', POKEMON_SKILLS_INDEX.INTUITION_MODIFIER],
                ['survival', POKEMON_SKILLS_INDEX.SURVIVAL_MODIFIER],
            ])('should set %s modifier to default value', (_, index) =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[index]).toBe(`'+0`);
            });

            it('should handle maximum dice value (6d6)', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.combat = '6d6+3';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.COMBAT_DICE]).toBe('6');
            });

            it('should handle maximum positive modifier (+6)', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.combat = '3d6+6';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.COMBAT_MODIFIER]).toBe(`'+6`);
            });

            it('should handle minimum negative modifier (-6)', () =>
            {
                // Arrange
                const fakemon = createPtuFakemonCollectionData({
                    dexType: PtuFakemonDexType.Eden,
                });
                fakemon.skills.combat = '3d6-6';

                // Act
                const result = adapter.transform(fakemon);

                // Assert
                expect(result.pokemonSkills[POKEMON_SKILLS_INDEX.COMBAT_MODIFIER]).toBe(`'-6`);
            });
        });
    });
});
