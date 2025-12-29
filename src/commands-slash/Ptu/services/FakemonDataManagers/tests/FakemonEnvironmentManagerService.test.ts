/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { chunkArray } from '../../../../../services/chunkArray/chunkArray';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { PokemonDiet, PokemonHabitat } from '../../../types/pokemon';
import { FakemonEnvironmentManagerService } from '../FakemonEnvironmentManagerService';

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

describe(`class: ${FakemonEnvironmentManagerService.name}`, () =>
{
    let allDiets: PokemonDiet[];
    let allHabitats: PokemonHabitat[];

    beforeEach(() =>
    {
        jest.clearAllMocks();
        allDiets = Object.values(PokemonDiet);
        allHabitats = Object.values(PokemonHabitat);
    });

    describe(`method: ${FakemonEnvironmentManagerService.setDiets.name}`, () =>
    {
        it(`should update the fakemon to have 0 diets`, async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonEnvironmentManagerService.setDiets({
                messageId,
                fakemon,
                diets: [],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { diets: [] },
            );
        });

        it.each(
            Object.values(PokemonDiet),
        )(`should update the fakemon's only diet to be '%s'`, async (diet) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonEnvironmentManagerService.setDiets({
                messageId,
                fakemon,
                diets: [diet],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { diets: [diet] },
            );
        });

        const dietsChunkedByTwo = chunkArray({
            array: Object.values(PokemonDiet),
            shouldMoveToNextChunk: (_, index) => index % 2 === 0 && index !== 0,
        });

        dietsChunkedByTwo.forEach((twoDiets) =>
        {
            it(`should update the fakemon's two diets to be '${twoDiets.join(`' & '`)}'`, async () =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData();
                const expectedResult = createPtuFakemonCollectionData();
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonEnvironmentManagerService.setDiets({
                    messageId,
                    fakemon,
                    diets: twoDiets,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    { diets: twoDiets },
                );
            });
        });

        it.each([3, 4, 5, 6])('should throw an error if provided %s diets (AKA: Not 0-2)', async (numOfDiets) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEnvironmentManagerService.setDiets({
                    messageId,
                    fakemon,
                    diets: Array.from({ length: numOfDiets }, (_, index) => allDiets[index]),
                }),
            ).rejects.toThrow('Fakemon must have 0-2 diets');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([1, 2])('should throw an error if provided %s invalid diet(s)', async (numOfDiets) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');
            const diets = Array.from({ length: numOfDiets }, () => 'INVALID' as PokemonDiet);

            // Act & Assert
            await expect(
                FakemonEnvironmentManagerService.setDiets({
                    messageId,
                    fakemon,
                    diets,
                }),
            ).rejects.toThrow(`Invalid diets: ${diets.join(', ')}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonEnvironmentManagerService.setHabitats.name}`, () =>
    {
        it(`should update the fakemon to have 0 habitats`, async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonEnvironmentManagerService.setHabitats({
                messageId,
                fakemon,
                habitats: [],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { habitats: [] },
            );
        });

        it.each(
            Object.values(PokemonHabitat),
        )(`should update the fakemon's only habitat to be '%s'`, async (habitat) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonEnvironmentManagerService.setHabitats({
                messageId,
                fakemon,
                habitats: [habitat],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { habitats: [habitat] },
            );
        });

        const habitatsChunkedByTwo = chunkArray({
            array: Object.values(PokemonHabitat),
            shouldMoveToNextChunk: (_, index) => index % 2 === 0 && index !== 0,
        });
        const habitatsChunkedByThree = chunkArray({
            array: Object.values(PokemonHabitat),
            shouldMoveToNextChunk: (_, index) => index % 3 === 0 && index !== 0,
        });
        const habitatsChunkedByFour = chunkArray({
            array: Object.values(PokemonHabitat),
            shouldMoveToNextChunk: (_, index) => index % 4 === 0 && index !== 0,
        });
        const habitatsChunkedByFive = chunkArray({
            array: Object.values(PokemonHabitat),
            shouldMoveToNextChunk: (_, index) => index % 5 === 0 && index !== 0,
        });

        [
            ['two', habitatsChunkedByTwo],
            ['three', habitatsChunkedByThree],
            ['four', habitatsChunkedByFour],
            ['five', habitatsChunkedByFive],
        ].forEach((args) =>
        {
            const [label, chunkedHabitats] = args as [string, PokemonHabitat[][]];
            chunkedHabitats.forEach((curHabitatChunk) =>
            {
                it(`should update the fakemon's ${label} habitats to be '${curHabitatChunk.join(`', '`)}'`, async () =>
                {
                    // Arrange
                    const messageId = 'messageId';
                    const fakemon = createPtuFakemonCollectionData();
                    const expectedResult = createPtuFakemonCollectionData();
                    const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                        .mockResolvedValue(expectedResult);

                    // Act
                    const result = await FakemonEnvironmentManagerService.setHabitats({
                        messageId,
                        fakemon,
                        habitats: curHabitatChunk,
                    });

                    // Assert
                    expect(result).toEqual(expectedResult);
                    expect(updateSpy).toHaveBeenCalledWith(
                        messageId,
                        { id: fakemon.id },
                        { habitats: curHabitatChunk },
                    );
                });
            });
        });

        it.each([6, 7, 8, 9])('should throw an error if provided %s habitats (AKA: Not 0-5)', async (numOfHabitats) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonEnvironmentManagerService.setHabitats({
                    messageId,
                    fakemon,
                    habitats: Array.from({ length: numOfHabitats }, (_, index) => allHabitats[index]),
                }),
            ).rejects.toThrow('Fakemon must have 0-5 habitats');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([1, 2, 3, 4, 5])('should throw an error if provided %s invalid habitats(s)', async (numOfHabitats) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');
            const habitats = Array.from({ length: numOfHabitats }, () => 'INVALID' as PokemonHabitat);

            // Act & Assert
            await expect(
                FakemonEnvironmentManagerService.setHabitats({
                    messageId,
                    fakemon,
                    habitats,
                }),
            ).rejects.toThrow(`Invalid habitats: ${habitats.join(', ')}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });
});
