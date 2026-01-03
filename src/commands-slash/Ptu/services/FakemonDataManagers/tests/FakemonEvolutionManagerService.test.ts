/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuFakemonCollection } from '../../../dal/models/PtuFakemonCollection';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { FakemonEvolutionManagerService } from '../FakemonEvolutionManagerService';
import { shuffleArrayTimes } from './util';

jest.mock('mongodb-controller');
jest.mock('../../../dal/PtuFakemonController');
jest.mock('../../../dal/PtuFakemonPseudoCache', () =>
{
    return {
        PtuFakemonPseudoCache: {
            update: jest.fn(),
        },
    };
});

describe(`class: ${FakemonEvolutionManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${FakemonEvolutionManagerService.addEvolutionStage.name}`, () =>
    {
        let defaultArgs: Parameters<typeof FakemonEvolutionManagerService['addEvolutionStage']>[0];

        beforeEach(() =>
        {
            defaultArgs = {
                messageId: 'messageid',
                fakemon: createPtuFakemonCollectionData(),
                name: 'Bulbasaur',
                level: 1,
                stage: 1,
            };
        });

        it('should add the evolution stage to the fakemon', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const expectedEvolution = [
                {
                    level: 1,
                    name: 'Bulbasaur',
                    stage: 1,
                },
                {
                    name: 'Ivysaur',
                    level: 15,
                    stage: 2,
                },
                {
                    name: 'Venusaur',
                    level: 30,
                    stage: 3,
                },
            ];

            // Act
            const result = await FakemonEvolutionManagerService.addEvolutionStage({
                ...defaultArgs,
                name: expectedEvolution[2].name,
                level: expectedEvolution[2].level,
                stage: expectedEvolution[2].stage,
                fakemon: {
                    ...defaultArgs.fakemon,
                    evolution: [
                        expectedEvolution[0],
                        expectedEvolution[1],
                    ],
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                { evolution: expectedEvolution },
            );
        });

        it('should add the evolution stage with an evolution condition to the fakemon', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const expectedEvolution = [
                {
                    level: 1,
                    name: 'Eevee',
                    stage: 1,
                },
                {
                    name: 'Flareon Fire Stone',
                    level: 10,
                    stage: 2,
                },
            ];

            // Act
            const result = await FakemonEvolutionManagerService.addEvolutionStage({
                ...defaultArgs,
                name: 'Flareon',
                level: expectedEvolution[1].level,
                stage: expectedEvolution[1].stage,
                evolutionCondition: 'Fire Stone',
                fakemon: {
                    ...defaultArgs.fakemon,
                    evolution: [expectedEvolution[0]],
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                { evolution: expectedEvolution },
            );
        });

        it('should sort evolution stages', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const expectedEvolution = [
                {
                    level: 1,
                    name: 'Bulbasaur',
                    stage: 1,
                },
                {
                    name: 'Ivysaur',
                    level: 15,
                    stage: 2,
                },
                {
                    name: 'Venusaur',
                    level: 30,
                    stage: 3,
                },
            ];

            // Act
            await FakemonEvolutionManagerService.addEvolutionStage({
                ...defaultArgs,
                name: expectedEvolution[1].name,
                level: expectedEvolution[1].level,
                stage: expectedEvolution[1].stage,
                fakemon: {
                    ...defaultArgs.fakemon,
                    evolution: [
                        expectedEvolution[2],
                        expectedEvolution[0],
                    ],
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                { evolution: expectedEvolution },
            );
        });

        it('should throw an error if name is empty', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.addEvolutionStage({
                    ...defaultArgs,
                    name: '',
                }),
            ).rejects.toThrow('Name cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if level is negative', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.addEvolutionStage({
                    ...defaultArgs,
                    level: -1,
                }),
            ).rejects.toThrow('Level cannot be negative');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if level is greater than 100', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.addEvolutionStage({
                    ...defaultArgs,
                    level: 101,
                }),
            ).rejects.toThrow('Level cannot be greater than 100');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if stage is negative', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.addEvolutionStage({
                    ...defaultArgs,
                    stage: -1,
                }),
            ).rejects.toThrow('Stage cannot be negative');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if stage is greater than 3', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.addEvolutionStage({
                    ...defaultArgs,
                    stage: 4,
                }),
            ).rejects.toThrow('Stage cannot be greater than 3');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it(`should throw an error if there's already an evolution stage with the same name`, async () =>
        {
            // Arrange
            const name = 'Bulbasaur';
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.addEvolutionStage({
                    ...defaultArgs,
                    name,
                    fakemon: {
                        ...defaultArgs.fakemon,
                        evolution: [
                            {
                                level: 1,
                                name, // Matching name
                                stage: 1,
                            },
                        ],
                    } as typeof defaultArgs.fakemon,
                }),
            ).rejects.toThrow(`Fakemon already has an evolution named ${name}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if fakemon already has 10 evolution stages', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.addEvolutionStage({
                    ...defaultArgs,
                    name: 'Pikachu',
                    level: 10,
                    stage: 2,
                    fakemon: {
                        ...defaultArgs.fakemon,
                        evolution: [
                            {
                                level: 1,
                                name: 'Bulbasaur',
                                stage: 1,
                            },
                            {
                                level: 1,
                                name: 'Charmander',
                                stage: 1,
                            },
                            {
                                level: 1,
                                name: 'Squirtle',
                                stage: 1,
                            },
                            {
                                name: 'Charmeleon',
                                level: 15,
                                stage: 2,
                            },
                            {
                                name: 'Ivysaur',
                                level: 15,
                                stage: 2,
                            },
                            {
                                name: 'Wartortle',
                                level: 15,
                                stage: 2,
                            },
                            {
                                name: 'Raichu Thunderstone',
                                level: 1,
                                stage: 3,
                            },
                            {
                                name: 'Blastoise',
                                level: 30,
                                stage: 3,
                            },
                            {
                                name: 'Charizard',
                                level: 30,
                                stage: 3,
                            },
                            {
                                name: 'Venusaur',
                                level: 30,
                                stage: 3,
                            },
                        ],
                    } as typeof defaultArgs.fakemon,
                }),
            ).rejects.toThrow('Fakemon cannot have more than 10 evolutions');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonEvolutionManagerService.editEvolutionStage.name}`, () =>
    {
        let defaultArgs: Parameters<typeof FakemonEvolutionManagerService['editEvolutionStage']>[0];

        beforeEach(() =>
        {
            defaultArgs = {
                messageId: 'messageid',
                fakemon: createPtuFakemonCollectionData(),
                previousName: 'Bulbosaur',
                new: {
                    name: 'Bulbasaur',
                    level: 1,
                    stage: 1,
                },
            };
        });

        it('should edit the evolution stage of the fakemon', async () =>
        {
            // Arrange
            const previousName = 'Bulbosaur';
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const expectedEvolution = [
                {
                    level: 1,
                    name: 'Bulbasaur',
                    stage: 1,
                },
                {
                    name: 'Ivysaur',
                    level: 15,
                    stage: 2,
                },
                {
                    name: 'Venusaur',
                    level: 30,
                    stage: 3,
                },
            ];

            // Act
            const result = await FakemonEvolutionManagerService.editEvolutionStage({
                ...defaultArgs,
                previousName,
                new: {
                    name: expectedEvolution[0].name,
                    level: expectedEvolution[0].level,
                    stage: expectedEvolution[0].stage,
                },
                fakemon: {
                    ...defaultArgs.fakemon,
                    evolution: [
                        { ...expectedEvolution[0], name: previousName },
                        ...expectedEvolution.slice(1),
                    ],
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                { evolution: expectedEvolution },
            );
        });

        it('should edit the evolution stage with an evolution condition of the fakemon', async () =>
        {
            // Arrange
            const previousName = 'Flareon Water Stone';
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const expectedEvolution = [
                {
                    level: 1,
                    name: 'Eevee',
                    stage: 1,
                },
                {
                    name: 'Flareon Fire Stone',
                    level: 10,
                    stage: 2,
                },
            ];

            // Act
            const result = await FakemonEvolutionManagerService.editEvolutionStage({
                ...defaultArgs,
                previousName,
                new: {
                    name: `Flareon`,
                    level: expectedEvolution[1].level,
                    stage: expectedEvolution[1].stage,
                    evolutionCondition: 'Fire Stone',
                },
                fakemon: {
                    ...defaultArgs.fakemon,
                    evolution: [
                        expectedEvolution[0],
                        { ...expectedEvolution[1], name: previousName },
                    ],
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                { evolution: expectedEvolution },
            );
        });

        it('should sort evolution stages', async () =>
        {
            // Arrange
            const previousName = 'Bulbosaur';
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const expectedEvolution = [
                {
                    level: 1,
                    name: 'Bulbasaur',
                    stage: 1,
                },
                {
                    name: 'Ivysaur',
                    level: 15,
                    stage: 2,
                },
                {
                    name: 'Venusaur',
                    level: 30,
                    stage: 3,
                },
            ];

            // Act
            const result = await FakemonEvolutionManagerService.editEvolutionStage({
                ...defaultArgs,
                previousName,
                new: {
                    name: expectedEvolution[0].name,
                    level: expectedEvolution[0].level,
                    stage: expectedEvolution[0].stage,
                },
                fakemon: {
                    ...defaultArgs.fakemon,
                    evolution: [
                        expectedEvolution[2],
                        { ...expectedEvolution[0], name: previousName },
                        expectedEvolution[1],
                    ],
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                { evolution: expectedEvolution },
            );
        });

        it('should throw an error if previous name is empty', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    previousName: '',
                }),
            ).rejects.toThrow('Previous name cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if new name is empty', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    new: { ...defaultArgs.new, name: '' },
                }),
            ).rejects.toThrow('New name cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if level is negative', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    new: { ...defaultArgs.new, level: -1 },
                }),
            ).rejects.toThrow('Level cannot be negative');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if level is greater than 100', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    new: { ...defaultArgs.new, level: 101 },
                }),
            ).rejects.toThrow('Level cannot be greater than 100');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if stage is negative', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    new: { ...defaultArgs.new, stage: -1 },
                }),
            ).rejects.toThrow('Stage cannot be negative');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if stage is greater than 3', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    new: { ...defaultArgs.new, stage: 4 },
                }),
            ).rejects.toThrow('Stage cannot be greater than 3');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it(`should throw an error if there's not an evolution stage with the previous name`, async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    previousName: 'INVALID',
                }),
            ).rejects.toThrow(`Fakemon does not have an evolution named INVALID`);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it(`should throw an error if there's already an evolution stage with the same name`, async () =>
        {
            // Arrange
            const name = 'Bulbasaur';
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    new: {
                        ...defaultArgs.new,
                        name,
                    },
                    fakemon: {
                        ...defaultArgs.fakemon,
                        evolution: [
                            {
                                level: 1,
                                name: defaultArgs.previousName,
                                stage: 1,
                            },
                            {
                                level: 1,
                                name, // Matching name
                                stage: 1,
                            },
                        ],
                    } as typeof defaultArgs.fakemon,
                }),
            ).rejects.toThrow(`Fakemon already has an evolution named ${name}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if fakemon already has 10 evolution stages', async () =>
        {
            // Arrange
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.editEvolutionStage({
                    ...defaultArgs,
                    previousName: 'Pikochu',
                    new: {
                        name: 'Pikachu',
                        level: 10,
                        stage: 2,
                    },
                    fakemon: {
                        ...defaultArgs.fakemon,
                        evolution: [
                            {
                                level: 1,
                                name: 'Bulbasaur',
                                stage: 1,
                            },
                            {
                                level: 1,
                                name: 'Charmander',
                                stage: 1,
                            },
                            {
                                level: 1,
                                name: 'Squirtle',
                                stage: 1,
                            },
                            {
                                name: 'Pikochu',
                                level: 10,
                                stage: 2,
                            },
                            {
                                name: 'Charmeleon',
                                level: 15,
                                stage: 2,
                            },
                            {
                                name: 'Ivysaur',
                                level: 15,
                                stage: 2,
                            },
                            {
                                name: 'Wartortle',
                                level: 15,
                                stage: 2,
                            },
                            {
                                name: 'Raichu Thunderstone',
                                level: 1,
                                stage: 3,
                            },
                            {
                                name: 'Blastoise',
                                level: 30,
                                stage: 3,
                            },
                            {
                                name: 'Charizard',
                                level: 30,
                                stage: 3,
                            },
                            {
                                name: 'Venusaur',
                                level: 30,
                                stage: 3,
                            },
                        ],
                    } as typeof defaultArgs.fakemon,
                }),
            ).rejects.toThrow('Fakemon cannot have more than 10 evolutions');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonEvolutionManagerService.removeEvolutionStage.name}`, () =>
    {
        let defaultArgs: Parameters<typeof FakemonEvolutionManagerService['removeEvolutionStage']>[0];
        let expectedEvolution: PtuFakemonCollection['evolution'];

        beforeEach(() =>
        {
            const fakemon = createPtuFakemonCollectionData();
            defaultArgs = {
                messageId: 'messageid',
                fakemon: {
                    ...fakemon,
                    evolution: [
                        {
                            level: 1,
                            name: 'Bulbasaur',
                            stage: 1,
                        },
                        {
                            level: 15,
                            name: 'Ivysaur',
                            stage: 2,
                        },
                        {
                            level: 30,
                            name: 'Venasaur',
                            stage: 3,
                        },
                    ],
                } as typeof fakemon,
                names: ['Ivysaur', 'Venasaur'],
            };
            expectedEvolution = [defaultArgs.fakemon.evolution[0]];
        });

        it('should remove the evolution stages with the given names', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonEvolutionManagerService.removeEvolutionStage(defaultArgs);

            // Act & Assert
            expect(result).toBe(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                { evolution: expectedEvolution },
            );
        });

        it('should throw error if there is no evolution stage with one of the given names', async () =>
        {
            // Arrange
            const invalidNames = ['INVALID1', 'INVALID2'];

            // Act & Assert
            await expect(
                FakemonEvolutionManagerService.removeEvolutionStage({
                    ...defaultArgs,
                    names: invalidNames,
                }),
            ).rejects.toThrow(`Fakemon does not have evolutions named ${invalidNames.join(', ')}`);
        });
    });

    describe(`method: ${FakemonEvolutionManagerService.extractEvolutionConditionFromName.name}`, () =>
    {
        it('should return the evolution condition when an evolution stone and gender is found', () =>
        {
            // Arrange
            const name = 'Gallade';
            const evolutionCondition = 'Dawn Stone Male';
            const evolutionStage: PtuFakemonCollection['evolution'][number] = {
                level: 1,
                name: `${name} ${evolutionCondition}`,
                stage: 1,
            };

            // Act
            const result = FakemonEvolutionManagerService.extractEvolutionConditionFromName(name, evolutionStage);

            // Assert
            expect(result).toEqual(evolutionCondition);
        });

        it('should return the evolution condition when holding an evolution stone is found', () =>
        {
            // Arrange
            const name = 'Kingdra';
            const evolutionCondition = 'Holding Dragon Scale';
            const evolutionStage: PtuFakemonCollection['evolution'][number] = {
                level: 1,
                name: `${name} ${evolutionCondition}`,
                stage: 1,
            };

            // Act
            const result = FakemonEvolutionManagerService.extractEvolutionConditionFromName(name, evolutionStage);

            // Assert
            expect(result).toEqual(evolutionCondition);
        });

        it('should return the evolution condition when an evolution stone is found', () =>
        {
            // Arrange
            const name = 'Flareon';
            const evolutionCondition = 'Fire Stone';
            const evolutionStage: PtuFakemonCollection['evolution'][number] = {
                level: 1,
                name: `${name} ${evolutionCondition}`,
                stage: 1,
            };

            // Act
            const result = FakemonEvolutionManagerService.extractEvolutionConditionFromName(name, evolutionStage);

            // Assert
            expect(result).toEqual(evolutionCondition);
        });

        it('should return the evolution condition when it is very long', () =>
        {
            // Arrange
            const name = 'Gougoah';
            const evolutionCondition = 'Either 20 Liked Gumdrops or 100 Unhated Gumdrops based on their Nature';
            const evolutionStage: PtuFakemonCollection['evolution'][number] = {
                level: 1,
                name: `${name} ${evolutionCondition}`,
                stage: 1,
            };

            // Act
            const result = FakemonEvolutionManagerService.extractEvolutionConditionFromName(name, evolutionStage);

            // Assert
            expect(result).toEqual(evolutionCondition);
        });

        it('should return undefined if species name is not found', () =>
        {
            // Arrange
            const name = 'Flareon';
            const evolutionCondition = 'Fire Stone';
            const evolutionStage: PtuFakemonCollection['evolution'][number] = {
                level: 1,
                name: `${name} ${evolutionCondition}`,
                stage: 1,
            };

            // Act
            const result = FakemonEvolutionManagerService.extractEvolutionConditionFromName('INVALID', evolutionStage);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should return undefined if no evolution condition is found', () =>
        {
            // Arrange
            const name = 'Bulbasaur';
            const evolutionStage: PtuFakemonCollection['evolution'][number] = {
                level: 1,
                name,
                stage: 1,
            };

            // Act
            const result = FakemonEvolutionManagerService.extractEvolutionConditionFromName(name, evolutionStage);

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe(`method: ${FakemonEvolutionManagerService['sortEvolutions'].name}`, () =>
    {
        const baseEvolution: PtuFakemonCollection['evolution'][number] = {
            level: 1,
            name: 'Bulbasaur',
            stage: 1,
        };

        it.each([[
            [1, 2, 3],
            [1, 3, 2],
            [2, 1, 3],
            [2, 3, 1],
            [3, 1, 2],
            [3, 2, 1],
        ]])(`should sort evolution stages: '%s' by stage first: ${[1, 2, 3].toString()}`, (stages) =>
        {
            // Arrange
            const evolution: PtuFakemonCollection['evolution'] = stages.map(stage => ({
                ...baseEvolution,
                stage,
            }));

            // Act
            const result = FakemonEvolutionManagerService['sortEvolutions'](evolution);

            // Assert
            expect(result).toEqual([
                {
                    ...baseEvolution,
                    stage: 1,
                },
                {
                    ...baseEvolution,
                    stage: 2,
                },
                {
                    ...baseEvolution,
                    stage: 3,
                },
            ]);
        });

        it.each([[
            [1, 2, 3],
            [1, 3, 2],
            [2, 1, 3],
            [2, 3, 1],
            [3, 1, 2],
            [3, 2, 1],
        ]])(`should sort evolution stages: '%s' by level second: ${[1, 2, 3].toString()}`, (levels) =>
        {
            // Arrange
            const evolution: PtuFakemonCollection['evolution'] = levels.map(level => ({
                ...baseEvolution,
                level,
            }));

            // Act
            const result = FakemonEvolutionManagerService['sortEvolutions'](evolution);

            // Assert
            expect(result).toEqual([
                {
                    ...baseEvolution,
                    level: 1,
                },
                {
                    ...baseEvolution,
                    level: 2,
                },
                {
                    ...baseEvolution,
                    level: 3,
                },
            ]);
        });

        it.each([[
            ['a', 'b', 'c'],
            ['a', 'c', 'b'],
            ['b', 'a', 'c'],
            ['b', 'c', 'a'],
            ['c', 'a', 'b'],
            ['c', 'b', 'a'],
        ]])(`should sort evolution stages: '%s' by name third: ${['a', 'b', 'c'].toString()}`, (names) =>
        {
            // Arrange
            const evolution: PtuFakemonCollection['evolution'] = names.map(name => ({
                ...baseEvolution,
                name,
            }));

            // Act
            const result = FakemonEvolutionManagerService['sortEvolutions'](evolution);

            // Assert
            expect(result).toEqual([
                {
                    ...baseEvolution,
                    name: 'a',
                },
                {
                    ...baseEvolution,
                    name: 'b',
                },
                {
                    ...baseEvolution,
                    name: 'c',
                },
            ]);
        });

        const allPossibleCombinations = [1, 2, 3].reduce<PtuFakemonCollection['evolution']>((acc1, stage) =>
        {
            const cur1 = [1, 2, 3].reduce<PtuFakemonCollection['evolution']>((acc2, level) =>
            {
                const cur2 = ['a', 'b', 'c'].reduce<PtuFakemonCollection['evolution']>((acc3, name) =>
                {
                    acc3.push({
                        stage,
                        level,
                        name,
                    });
                    return acc3;
                }, []);

                acc2.push(...cur2);
                return acc2;
            }, []);

            acc1.push(...cur1);
            return acc1;
        }, []);

        // Ensure random combinations are always sorted in the same way
        [
            allPossibleCombinations,
            ...shuffleArrayTimes(allPossibleCombinations, 9),
        ].forEach((evolution, index) =>
        {
            it(`should sort evolution stages by stage, level, then name randomized #${index + 1}`, () =>
            {
                // Act
                const result = FakemonEvolutionManagerService['sortEvolutions'](evolution);

                // Assert
                expect(result).toEqual(allPossibleCombinations);
            });
        });

        it('should return empty array if empty array is provided', () =>
        {
            // Act
            const result = FakemonEvolutionManagerService['sortEvolutions']([]);

            // Assert
            expect(result).toEqual([]);
        });
    });
});
