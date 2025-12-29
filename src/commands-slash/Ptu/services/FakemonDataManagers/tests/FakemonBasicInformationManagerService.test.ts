/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { FakemonStatsEditStringSelectElementOptions } from '../../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { PokemonType } from '../../../types/pokemon';
import { FakemonBasicInformationManagerService } from '../FakemonBasicInformationManagerService';
import { chunkArray } from '../../../../../services/chunkArray/chunkArray';

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
            const types = Array.from({ length: numOfTypes }, (_, index) => 'INVALID' as PokemonType);

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
});
