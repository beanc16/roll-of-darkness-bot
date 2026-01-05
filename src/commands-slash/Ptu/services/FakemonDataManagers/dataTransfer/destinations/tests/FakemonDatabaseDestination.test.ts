/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { MongoDbResults } from 'mongodb-controller';

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { PokemonController } from '../../../../../dal/PtuController.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { createPtuPokemonCollectionData as createPtuPokemonCollectionDataOriginal } from '../../../../../fakes/PtuPokemonCollection.fakes.js';
import {
    PokemonDiet,
    PokemonEggGroup,
    PokemonHabitat,
    PokemonType,
    PtuHeight,
    PtuNaturewalk,
} from '../../../../../types/pokemon.js';
import { FakemonGeneralInformationManagerService } from '../../../FakemonGeneralInformationManagerService.js';
import { FakemonDatabaseDestination } from '../FakemonDatabaseDestination.js';

jest.mock('../../../../../dal/PtuController', () =>
{
    return {
        PokemonController: {
            insertOneIfNotExists: jest.fn(),
            getAll: jest.fn(),
        },
    };
});

jest.mock('../../../FakemonGeneralInformationManagerService', () =>
{
    return {
        FakemonGeneralInformationManagerService: {
            updateTransferredTo: jest.fn(),
        },
    };
});

const createPtuPokemonCollectionData = (): ReturnType<typeof createPtuPokemonCollectionDataOriginal> =>
{
    const result = createPtuPokemonCollectionDataOriginal();
    result.metadata.dexNumber = '#001'; // Prevent undefined error
    return result;
};

describe(`class: ${FakemonDatabaseDestination.name}`, () =>
{
    let destination: FakemonDatabaseDestination;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        destination = new FakemonDatabaseDestination();
    });

    describe(`method: ${FakemonDatabaseDestination.prototype.create.name}`, () =>
    {
        it('should validate input, insert pokemon, and update transfer status', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const insertOneIfNotExistsSpy = jest.spyOn(PokemonController, 'insertOneIfNotExists');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(validateInputSpy).toHaveBeenCalledTimes(1);
            expect(validateInputSpy).toHaveBeenCalledWith(input);
            expect(insertOneIfNotExistsSpy).toHaveBeenCalledTimes(1);
            expect(insertOneIfNotExistsSpy).toHaveBeenCalledWith(
                {
                    // eslint-disable-next-line no-underscore-dangle
                    $or: [{ _id: input._id }, { name: input.name }],
                },
                input,
            );
            expect(updateTransferredToSpy).toHaveBeenCalledTimes(1);
            expect(updateTransferredToSpy).toHaveBeenCalledWith({
                fakemon: source,
                transferredTo: {
                    ptuDatabase: true,
                },
            });
        });

        it('should throw an error if validateInput fails', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            input.name = '';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput');
            const insertOneIfNotExistsSpy = jest.spyOn(PokemonController, 'insertOneIfNotExists');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Pokemon name must not be empty');
            expect(validateInputSpy).toHaveBeenCalled();
            expect(insertOneIfNotExistsSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonDatabaseDestination.prototype['validateInput'].name}`, () =>
    {
        describe('pokemon existence', () =>
        {
            it('should throw an error if pokemon is falsy', () =>
            {
                // Arrange
                const input = null as unknown as Parameters<typeof destination['validateInput']>[0];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must be truthy');
            });

            it('should not throw an error if pokemon is truthy', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('name validation', () =>
        {
            it('should throw an error if pokemon name is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.name = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon name must not be empty');
            });

            it('should throw an error if pokemon name is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.name = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon name must not be empty');
            });

            it('should not throw an error if pokemon name is valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.name = 'Pikachu';

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('types validation', () =>
        {
            it('should throw an error if pokemon has no types', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.types = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 types');
            });

            it('should throw an error if pokemon has 3 types', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.types = [PokemonType.Fire, PokemonType.Flying, PokemonType.Water];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 types');
            });

            it(`should throw an error if one of a pokemon's types are invalid`, () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.types = [PokemonType.Fire, 'InvalidType'] as unknown as PokemonType[];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon types');
            });

            it('should not throw an error if pokemon has one valid type', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.types = [PokemonType.Fire];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if pokemon has two valid types', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.types = [PokemonType.Fire, PokemonType.Flying];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('base stats validation', () =>
        {
            it('should throw an error if pokemon does not have 6 base stats', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.baseStats = {
                    hp: 10,
                    attack: 10,
                    defense: 10,
                    specialAttack: 10,
                    specialDefense: 10,
                    // missing speed
                } as typeof input['baseStats'];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 6 base stats');
            });

            it('should throw an error if any base stat is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.baseStats.hp = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('All pokemon stats must be positive');
            });

            it('should not throw an error if all base stats are zero or positive', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.baseStats = {
                    hp: 0,
                    attack: 10,
                    defense: 10,
                    specialAttack: 10,
                    specialDefense: 10,
                    speed: 10,
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('abilities validation', () =>
        {
            it('should throw an error if pokemon has less than 1 basic ability', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities.basicAbilities = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 basic abilities');
            });

            it('should throw an error if pokemon has more than 2 basic abilities', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities.basicAbilities = ['Ability1', 'Ability2', 'Ability3'];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 basic abilities');
            });

            it('should throw an error if pokemon has less than 2 advanced abilities', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities.advancedAbilities = ['Ability1'];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 2-3 advanced abilities');
            });

            it('should throw an error if pokemon has more than 3 advanced abilities', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities.advancedAbilities = ['Ability1', 'Ability2', 'Ability3', 'Ability4'];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 2-3 advanced abilities');
            });

            it('should throw an error if high ability is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities.highAbility = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1 high ability');
            });

            it('should throw an error if high ability is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities.highAbility = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1 high ability');
            });

            it('should throw an error if pokemon has 1 basic abilities, 2 advanced abilities and 1 high ability', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities = {
                    basicAbilities: ['Ability1'],
                    advancedAbilities: ['Ability2', 'Ability3'],
                    highAbility: 'Ability4',
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1 basic ability, 3 advanced abilities and 1 high ability OR 2 basic abilities, 2 advanced abilities and 1 high ability');
            });

            it('should throw an error if pokemon has 2 basic abilities, 3 advanced abilities and 1 high ability', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities = {
                    basicAbilities: ['Ability1', 'Ability2'],
                    advancedAbilities: ['Ability3', 'Ability4', 'Ability5'],
                    highAbility: 'Ability6',
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1 basic ability, 3 advanced abilities and 1 high ability OR 2 basic abilities, 2 advanced abilities and 1 high ability');
            });

            it('should not throw an error if pokemon has 1 basic ability, 3 advanced abilities and 1 high ability', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities = {
                    basicAbilities: ['Ability1'],
                    advancedAbilities: ['Ability2', 'Ability3', 'Ability4'],
                    highAbility: 'Ability5',
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if pokemon has 2 basic abilities, 2 advanced abilities and 1 high ability', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.abilities = {
                    basicAbilities: ['Ability1', 'Ability2'],
                    advancedAbilities: ['Ability3', 'Ability4'],
                    highAbility: 'Ability5',
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('evolution validation', () =>
        {
            it('should throw an error if pokemon has no evolution stages', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have at least one evolution stage');
            });

            it('should throw an error if evolution stage has empty name', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [
                    {
                        name: '', level: 1, stage: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon evolution');
            });

            it('should throw an error if evolution stage has only whitespace name', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [
                    {
                        name: '   ', level: 1, stage: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon evolution');
            });

            it('should throw an error if evolution stage is less than 1', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [
                    {
                        name: 'Pikachu', level: 1, stage: 0,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon evolution');
            });

            it('should throw an error if evolution stage is greater than 3', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [
                    {
                        name: 'Pikachu', level: 1, stage: 4,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon evolution');
            });

            it('should throw an error if evolution level is 0', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [
                    {
                        name: 'Pikachu', level: 0, stage: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon evolution');
            });

            it('should throw an error if evolution level is greater than 100', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [
                    {
                        name: 'Pikachu', level: 101, stage: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon evolution');
            });

            it('should not throw an error if evolutions are valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.evolution = [
                    {
                        name: 'Squirtle', level: 1, stage: 1,
                    },
                    {
                        name: 'Wartortle', level: 15, stage: 2,
                    },
                    {
                        name: 'Blastoise', level: 30, stage: 3,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('size information validation', () =>
        {
            it('should throw an error if height freedom is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.height.freedom = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a height in imperial units');
            });

            it('should throw an error if height freedom is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.height.freedom = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a height in imperial units');
            });

            it('should throw an error if height metric is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.height.metric = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a height in metric units');
            });

            it('should throw an error if height metric is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.height.metric = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a height in metric units');
            });

            it('should throw an error if height ptu is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.height.ptu = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a height in ptu units');
            });

            it('should throw an error if height ptu is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.height.ptu = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a height in ptu units');
            });

            it('should throw an error if height ptu is invalid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.height.ptu = 'invalid' as PtuHeight;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon height');
            });

            it('should throw an error if weight freedom is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.weight.freedom = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a weight in imperial units');
            });

            it('should throw an error if weight freedom is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.weight.freedom = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a weight in imperial units');
            });

            it('should throw an error if weight metric is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.weight.metric = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a weight in metric units');
            });

            it('should throw an error if weight metric is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.weight.metric = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a weight in metric units');
            });

            it('should throw an error if weight ptu is 0', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.weight.ptu = 0;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a weight in ptu units between 1-7');
            });

            it('should throw an error if weight ptu is greater than 7', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.sizeInformation.weight.ptu = 8;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a weight in ptu units between 1-7');
            });

            it('should not throw an error if size information is valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('breeding information validation', () =>
        {
            it('should throw an error if average hatch rate is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.averageHatchRate = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an average hatch rate');
            });

            it('should throw an error if average hatch rate is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.averageHatchRate = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an average hatch rate');
            });

            it('should throw an error if pokemon has less than 1 egg group', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.eggGroups = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 egg groups');
            });

            it('should throw an error if pokemon has more than 3 egg groups', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.eggGroups = [
                    PokemonEggGroup.Monster,
                    PokemonEggGroup.Dragon,
                    PokemonEggGroup.Field,
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 egg groups');
            });

            it('should throw an error if egg group is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.eggGroups = [''];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon egg groups');
            });

            it('should throw an error if egg group is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.eggGroups = ['   '];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon egg groups');
            });

            it('should throw an error if egg group is invalid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.eggGroups = ['InvalidEggGroup'];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon egg groups');
            });

            it('should throw an error if gender ratio male and female do not sum to 100', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.genderRatio = { male: 60, female: 50 };

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Male and female gender ratios must add up to 100');
            });

            it('should throw an error if gender ratio has male, female, and none undefined', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.genderRatio = { none: undefined };

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('None gender ratio must be true when male and female are undefined');
            });

            it('should not throw an error if gender ratio is valid with male and female', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.genderRatio = { male: 50, female: 50 };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if gender ratio is valid with none true', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation.genderRatio = { none: true };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if breeding information is valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.breedingInformation = {
                    genderRatio: { male: 50, female: 50 },
                    eggGroups: [PokemonEggGroup.Monster, PokemonEggGroup.Dragon],
                    averageHatchRate: '20 Days',
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('diets validation', () =>
        {
            it('should throw an error if pokemon has less than 1 diet', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.diets = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 diets');
            });

            it('should throw an error if pokemon has more than 2 diets', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.diets = [
                    PokemonDiet.Carnivore,
                    PokemonDiet.Herbivore,
                    PokemonDiet.Omnivore,
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-2 diets');
            });

            it('should throw an error if diet is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.diets = [''];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon diets');
            });

            it('should throw an error if diet is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.diets = ['   '];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon diets');
            });

            it('should throw an error if diet is invalid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.diets = ['InvalidDiet'];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon diets');
            });

            it('should not throw an error if diets are valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.diets = [PokemonDiet.Carnivore, PokemonDiet.Herbivore];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('habitats validation', () =>
        {
            it('should throw an error if pokemon has less than 1 habitat', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.habitats = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-5 habitats');
            });

            it('should throw an error if pokemon has more than 5 habitats', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.habitats = [
                    PokemonHabitat.Arctic,
                    PokemonHabitat.Cave,
                    PokemonHabitat.Tundra,
                    PokemonHabitat.Taiga,
                    PokemonHabitat.Tundra,
                    PokemonHabitat.Underground,
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have 1-5 habitats');
            });

            it('should throw an error if habitat is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.habitats = [''];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon habitats');
            });

            it('should throw an error if habitat is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.habitats = ['   '];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon habitats');
            });

            it('should throw an error if habitat is invalid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.habitats = ['InvalidHabitat'];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid pokemon habitats');
            });

            it('should not throw an error if habitats are valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.habitats = [PokemonHabitat.Forest, PokemonHabitat.Mountain];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('capabilities validation', () =>
        {
            it('should throw an error if overland capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.overland = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Overland capability cannot be negative');
            });

            it('should throw an error if swim capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.swim = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Swim capability cannot be negative');
            });

            it('should throw an error if sky capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.sky = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Sky capability cannot be negative');
            });

            it('should throw an error if levitate capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.levitate = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Levitate capability cannot be negative');
            });

            it('should throw an error if burrow capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.burrow = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Burrow capability cannot be negative');
            });

            it('should throw an error if high jump capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.highJump = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('High jump capability cannot be negative');
            });

            it('should throw an error if low jump capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.lowJump = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Low jump capability cannot be negative');
            });

            it('should throw an error if power capability is negative', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.power = -1;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Power capability cannot be negative');
            });

            it('should throw an error if other capabilities is not an array', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.other = 'invalid' as unknown as typeof input.capabilities.other;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Other capabilities must be an array or undefined');
            });

            it('should not throw an error if other capabilities is undefined', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.other = undefined;

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if other capabilities is an empty array', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities.other = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if capabilities are valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.capabilities = {
                    overland: 6,
                    swim: 4,
                    sky: 8,
                    levitate: 0,
                    burrow: undefined,
                    highJump: 2,
                    lowJump: 1,
                    power: 5,
                    other: [`Naturewalk (${PtuNaturewalk.Forest})`],
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('skills validation', () =>
        {
            it('should throw an error if acrobatics skill is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.acrobatics = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an acrobatics skill');
            });

            it('should throw an error if acrobatics skill is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.acrobatics = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an acrobatics skill');
            });

            it('should throw an error if athletics skill is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.athletics = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an athletics skill');
            });

            it('should throw an error if athletics skill is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.athletics = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an athletics skill');
            });

            it('should throw an error if combat skill is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.combat = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a combat skill');
            });

            it('should throw an error if combat skill is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.combat = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a combat skill');
            });

            it('should throw an error if focus skill is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.focus = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an focus skill');
            });

            it('should throw an error if focus skill is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.focus = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an focus skill');
            });

            it('should throw an error if perception skill is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.perception = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a perception skill');
            });

            it('should throw an error if perception skill is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.perception = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a perception skill');
            });

            it('should throw an error if stealth skill is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.stealth = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a stealth skill');
            });

            it('should throw an error if stealth skill is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.skills.stealth = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a stealth skill');
            });

            it('should not throw an error if skills are valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('move list validation', () =>
        {
            it('should throw an error if pokemon does not have a move list', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList = null as unknown as typeof input.moveList;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a move list');
            });

            it('should throw an error if pokemon does not have a level up move list', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = null as unknown as typeof input.moveList.levelUp;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a level up move list');
            });

            it('should throw an error if pokemon does not have an egg move list', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.eggMoves = null as unknown as typeof input.moveList.eggMoves;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an egg move list');
            });

            it('should throw an error if pokemon does not have a tm/hm move list', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.tmHm = null as unknown as typeof input.moveList.tmHm;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a tm/hm move list');
            });

            it('should throw an error if pokemon does not have a tutor move list', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.tutorMoves = null as unknown as typeof input.moveList.tutorMoves;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a tutor move list');
            });

            it('should throw an error if zygarde cube moves is not undefined or array', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.zygardeCubeMoves = 'invalid' as unknown as typeof input.moveList.zygardeCubeMoves;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have an undefined or array zygarde cube move list');
            });

            it('should throw an error if level up move list is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have at least one level up move');
            });

            it('should throw an error if level up move list more than 50 moves', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = Array.from(({ length: 51 }), (_, index) => ({
                    level: index,
                    move: `move-${index}`,
                    type: PokemonType.Fire,
                }));

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have less than 50 level up moves');
            });

            it('should throw an error if level up move has empty move name', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: '', type: PokemonType.Fire, level: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid level up moves');
            });

            it('should throw an error if level up move has only whitespace move name', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: '   ', type: PokemonType.Fire, level: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid level up moves');
            });

            it('should throw an error if level up move has empty type', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: 'Tackle', type: '', level: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid level up moves');
            });

            it('should throw an error if level up move has only whitespace type', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: 'Tackle', type: '   ', level: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid level up moves');
            });

            it('should throw an error if level up move has invalid type', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: 'Tackle', type: 'InvalidType', level: 1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid level up moves');
            });

            it('should throw an error if level up move has negative level', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: 'Tackle', type: PokemonType.Normal, level: -1,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid level up moves');
            });

            it('should throw an error if level up move has level greater than 100', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: 'Tackle', type: PokemonType.Normal, level: 101,
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid level up moves');
            });

            it('should not throw an error if level up move has string level', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.levelUp = [
                    {
                        move: 'Tackle', type: PokemonType.Normal, level: 'Evo',
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should throw an error if egg move is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.eggMoves = [''];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid egg moves');
            });

            it('should throw an error if egg move is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.eggMoves = ['   '];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid egg moves');
            });

            it('should throw an error if tm/hm move is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.tmHm = [''];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid tm/hm moves');
            });

            it('should throw an error if tm/hm move is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.tmHm = ['   '];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid tm/hm moves');
            });

            it('should throw an error if tutor move is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.tutorMoves = [''];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid tutor moves');
            });

            it('should throw an error if tutor move is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.tutorMoves = ['   '];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid tutor moves');
            });

            it('should throw an error if zygarde cube move is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.zygardeCubeMoves = [''];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid zygarde cube moves');
            });

            it('should throw an error if zygarde cube move is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.moveList.zygardeCubeMoves = ['   '];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid zygarde cube moves');
            });

            it('should not throw an error if move list is valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('metadata validation', () =>
        {
            it('should throw an error if dex number is undefined', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.dexNumber = undefined;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon must have a dex number');
            });

            it('should throw an error if dex number is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.dexNumber = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon dex number cannot be empty');
            });

            it('should throw an error if dex number is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.dexNumber = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon dex number cannot be empty');
            });

            it('should throw an error if source is empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.source = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon source cannot be empty');
            });

            it('should throw an error if source is only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.source = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon source cannot be empty');
            });

            it('should throw an error if image url is defined but empty', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.imageUrl = '';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon image url must be undefined or not empty');
            });

            it('should throw an error if image url is defined but only whitespace', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.imageUrl = '   ';

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Pokemon image url must be undefined or not empty');
            });

            it('should not throw an error if image url is undefined', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata.imageUrl = undefined;

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if metadata is valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.metadata = {
                    source: 'Eden Dex',
                    dexNumber: '#001',
                    page: 'p.123',
                    imageUrl: 'https://example.com/image.png',
                };

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });

        describe('mega evolutions validation', () =>
        {
            it('should throw an error if mega evolutions is not undefined or array', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = 'invalid' as unknown as typeof input.megaEvolutions;

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Mega evolutions must be an array or undefined');
            });

            it('should throw an error if mega evolution has empty name', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: '',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has only whitespace name', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: '   ',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has invalid type', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: ['InvalidType'],
                        ability: 'Solar Power',
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has empty ability', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: '',
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has only whitespace ability', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: '   ',
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has defined but empty ability shift', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        abilityShift: '',
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has defined but only whitespace ability shift', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        abilityShift: '   ',
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution capabilities is not undefined or array', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        capabilities: 'invalid' as unknown as NonNullable<typeof input.megaEvolutions>[number]['capabilities'],
                        stats: {},
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has stat with empty value', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        stats: { attack: '' },
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has undefined stats', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        stats: undefined as unknown as NonNullable<typeof input.megaEvolutions>[number]['stats'],
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should throw an error if mega evolution has stat with only whitespace value', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        stats: { attack: '   ' },
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).toThrow('Invalid mega evolution(s)');
            });

            it('should not throw an error if mega evolutions is undefined', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = undefined;

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if mega evolution has empty types array', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [],
                        ability: 'Solar Power',
                        stats: { attack: '+2' },
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if mega evolution has undefined ability shift', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        abilityShift: undefined,
                        stats: { attack: '+2' },
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if mega evolution has undefined capabilities', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard',
                        types: [PokemonType.Fire],
                        ability: 'Solar Power',
                        capabilities: undefined,
                        stats: { attack: '+2' },
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });

            it('should not throw an error if mega evolution is valid', () =>
            {
                // Arrange
                const input = createPtuPokemonCollectionData();
                input.megaEvolutions = [
                    {
                        name: 'Mega Charizard Y',
                        types: [PokemonType.Fire, PokemonType.Flying],
                        ability: 'Drought',
                        abilityShift: 'Solar Power',
                        capabilities: ['Teleporter 5'],
                        stats: { specialAttack: '+4', specialDefense: '+2' },
                    },
                ];

                // Act & Assert
                expect(() => destination['validateInput'](input)).not.toThrow();
            });
        });
    });

    describe(`method: ${FakemonDatabaseDestination.prototype.wasTransferred.name}`, () =>
    {
        it('should return true if pokemon exists in database and source was transferred to ptu database', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.ptuDatabase = true;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [input] } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(getAllSpy).toHaveBeenCalledWith({
                // eslint-disable-next-line no-underscore-dangle
                $or: [{ _id: input._id }, { name: input.name }],
            });
            expect(result).toBe(true);
        });

        it('should return false if pokemon exists in database but source was not transferred to ptu database', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.ptuDatabase = false;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [input] } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if pokemon does not exist in database but source says it was transferred to ptu database', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.ptuDatabase = true;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [] } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if results from database are undefined but source says it was transferred to ptu database', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.ptuDatabase = true;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: undefined } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if pokemon does not exist in database and source was not transferred', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.ptuDatabase = false;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [] } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });
    });
});
