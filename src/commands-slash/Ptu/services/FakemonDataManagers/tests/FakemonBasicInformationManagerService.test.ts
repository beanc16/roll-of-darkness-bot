/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { chunkArray } from '../../../../../services/chunkArray/chunkArray';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { PokemonType } from '../../../types/pokemon';
import { FakemonBasicInformationManagerService } from '../FakemonBasicInformationManagerService';

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

describe(`class: ${FakemonBasicInformationManagerService.name}`, () =>
{
    let allTypes: PokemonType[];

    beforeEach(() =>
    {
        jest.clearAllMocks();
        allTypes = Object.values(PokemonType);
    });

    describe(`method: ${FakemonBasicInformationManagerService.setTypes.name}`, () =>
    {
        it.each(
            Object.values(PokemonType),
        )(`should update the fakemon's only type to be '%s'`, async (type) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonBasicInformationManagerService.setTypes({
                messageId,
                fakemon,
                types: [type],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { types: [type] },
            );
        });

        const typesChunkedByTwo = chunkArray({
            array: Object.values(PokemonType),
            shouldMoveToNextChunk: (_, index) => index % 2 === 0 && index !== 0,
        });

        typesChunkedByTwo.forEach((twoTypes) =>
        {
            it(`should update the fakemon's two types to be '${twoTypes.join(`' & '`)}'`, async () =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData();
                const expectedResult = createPtuFakemonCollectionData();
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonBasicInformationManagerService.setTypes({
                    messageId,
                    fakemon,
                    types: twoTypes,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    { types: twoTypes },
                );
            });
        });

        it.each([0, 3, 4, 5])('should throw an error if provided %s types (AKA: Not 1-2)', async (numOfTypes) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setTypes({
                    messageId,
                    fakemon,
                    types: Array.from({ length: numOfTypes }, (_, index) => allTypes[index]),
                }),
            ).rejects.toThrow('Fakemon must have 1-2 types');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([1, 2])('should throw an error if provided %s invalid type(s)', async (numOfTypes) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');
            const types = Array.from({ length: numOfTypes }, () => 'INVALID' as PokemonType);

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setTypes({
                    messageId,
                    fakemon,
                    types,
                }),
            ).rejects.toThrow(`Invalid types: ${types.join(', ')}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonBasicInformationManagerService.setAbilities.name}`, () =>
    {
        it(`should update the fakemon's abilities`, async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const args: Parameters<typeof FakemonBasicInformationManagerService.setAbilities>[0] = {
                messageId,
                fakemon,
                abilities: {
                    basicAbilities: ['Ability 1', 'Ability 2'],
                    advancedAbilities: ['Ability 3', 'Ability 4'],
                    highAbility: 'Ability 5',
                },
            };

            // Act
            const result = await FakemonBasicInformationManagerService.setAbilities(args);

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { abilities: args.abilities },
            );
        });

        it('should not update if no abilities are provided', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {},
                }),
            ).resolves.not.toThrow();
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should not throw an error if 2 basic abilities, 2 advanced abilities, & 1 high ability are provided', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {
                        basicAbilities: ['Ability 1', 'Ability 2'],
                        advancedAbilities: ['Ability 3', 'Ability 4'],
                        highAbility: 'Ability 5',
                    },
                }),
            ).resolves.not.toThrow();
            expect(updateSpy).toHaveBeenCalled();
        });

        it('should not throw an error if 1 basic ability, 3 advanced abilities, & 1 high ability are provided', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {
                        basicAbilities: ['Ability 1'],
                        advancedAbilities: ['Ability 2', 'Ability 3', 'Ability 4'],
                        highAbility: 'Ability 5',
                    },
                }),
            ).resolves.not.toThrow();
            expect(updateSpy).toHaveBeenCalled();
        });

        it.each([0, 3, 4, 5])('should throw an error if provided %s basic abilities (AKA: Not 1-2)', async (numOfAbilities) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {
                        basicAbilities: Array.from({ length: numOfAbilities }, (_, index) => `Ability ${index}`),
                    },
                }),
            ).rejects.toThrow('Fakemon must have 1-2 basic abilities');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([0, 4, 5, 6])('should throw an error if provided %s advanced abilities (AKA: Not 1-3)', async (numOfAbilities) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {
                        advancedAbilities: Array.from({ length: numOfAbilities }, (_, index) => `Ability ${index}`),
                    },
                }),
            ).rejects.toThrow('Fakemon must have 1-3 advanced abilities');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if provided no high ability (AKA: Not 1)', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {
                        advancedAbilities: Array.from({ length: 2 }, (_, index) => `Ability ${index}`),
                    },
                }),
            ).rejects.toThrow('Fakemon must have a high ability');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if not provided 2 basic abilities, 2 advanced abilities, & 1 high ability OR not provided 1 basic ability, 3 advanced abilities, & 1 high ability', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert - 2 basic abilities, "2" advanced abilities, & 1 high ability
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {
                        basicAbilities: Array.from({ length: 2 }, (_, index) => `Ability ${index}`),
                        advancedAbilities: Array.from({ length: 3 }, (_, index) => `Ability ${index}`),
                        highAbility: 'Ability 5',
                    },
                }),
            ).rejects.toThrow('Fakemon must have 2 basic abilities and 2 advanced abilities OR 1 basic ability and 3 advanced abilities');
            expect(updateSpy).not.toHaveBeenCalled();

            // Act & Assert - 1 basic ability, "3" advanced abilities, & 1 high ability
            await expect(
                FakemonBasicInformationManagerService.setAbilities({
                    messageId,
                    fakemon,
                    abilities: {
                        basicAbilities: Array.from({ length: 1 }, (_, index) => `Ability ${index}`),
                        advancedAbilities: Array.from({ length: 2 }, (_, index) => `Ability ${index}`),
                        highAbility: 'Ability 5',
                    },
                }),
            ).rejects.toThrow('Fakemon must have 2 basic abilities and 2 advanced abilities OR 1 basic ability and 3 advanced abilities');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });
});
