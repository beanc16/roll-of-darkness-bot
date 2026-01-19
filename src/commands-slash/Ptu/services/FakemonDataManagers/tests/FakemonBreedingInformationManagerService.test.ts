/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { chunkArray } from '../../../../../services/chunkArray/chunkArray';
import { PtuFakemonCollection } from '../../../dal/models/PtuFakemonCollection';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { PokemonEggGroup, PokemonGenderRatio } from '../../../types/pokemon';
import { FakemonBreedingInformationManagerService } from '../FakemonBreedingInformationManagerService';

jest.mock('../../../dal/PtuFakemonController');
jest.mock('../../../dal/PtuFakemonPseudoCache', () =>
{
    return {
        PtuFakemonPseudoCache: {
            update: jest.fn(),
        },
    };
});

describe(`class: ${FakemonBreedingInformationManagerService.name}`, () =>
{
    let allEggGroups: PokemonEggGroup[];

    const genderRatioAndExpectedResultTuple = [
        [PokemonGenderRatio.Male50Female50, { male: 50, female: 50 }],
        [PokemonGenderRatio.NoGender, { none: true }],
        [PokemonGenderRatio.Male100Female0, { male: 100, female: 0 }],
        [PokemonGenderRatio.Male0Female100, { male: 0, female: 100 }],
        [PokemonGenderRatio.Male75Female25, { male: 75, female: 25 }],
        [PokemonGenderRatio.Male25Female75, { male: 25, female: 75 }],
        [PokemonGenderRatio.Male875Female125, { male: 87.5, female: 12.5 }],
        [PokemonGenderRatio.Male125Female875, { male: 12.5, female: 87.5 }],
    ] as [PokemonGenderRatio, PtuFakemonCollection['breedingInformation']['genderRatio']][];

    beforeEach(() =>
    {
        jest.clearAllMocks();
        allEggGroups = Object.values(PokemonEggGroup);
    });

    describe(`method: ${FakemonBreedingInformationManagerService.setEggGroups.name}`, () =>
    {
        it(`should update the fakemon to have the None egg group if an empty array is provided`, async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonBreedingInformationManagerService.setEggGroups({
                messageId,
                fakemon,
                eggGroups: [],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    breedingInformation: {
                        ...fakemon.breedingInformation,
                        eggGroups: [PokemonEggGroup.None],
                    },
                },
            );
        });

        it.each(
            Object.values(PokemonEggGroup),
        )(`should update the fakemon's only egg group to be '%s'`, async (eggGroup) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonBreedingInformationManagerService.setEggGroups({
                messageId,
                fakemon,
                eggGroups: [eggGroup],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    breedingInformation: {
                        ...fakemon.breedingInformation,
                        eggGroups: [eggGroup],
                    },
                },
            );
        });

        const eggGroupsChunkedByTwo = chunkArray({
            array: Object.values(PokemonEggGroup).filter((eggGroup) => eggGroup !== PokemonEggGroup.None),
            shouldMoveToNextChunk: (_, index) => index % 2 === 0 && index !== 0,
        });

        eggGroupsChunkedByTwo.forEach((twoEggGroups) =>
        {
            it(`should update the fakemon's two egg groups to be '${twoEggGroups.join(`' & '`)}'`, async () =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData();
                const expectedResult = createPtuFakemonCollectionData();
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonBreedingInformationManagerService.setEggGroups({
                    messageId,
                    fakemon,
                    eggGroups: twoEggGroups,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        breedingInformation: {
                            ...fakemon.breedingInformation,
                            eggGroups: twoEggGroups,
                        },
                    },
                );
            });
        });

        it.each([3, 4, 5, 6])('should throw an error if provided %s egg groups (AKA: Not 0-2)', async (numOfEggGroups) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBreedingInformationManagerService.setEggGroups({
                    messageId,
                    fakemon,
                    eggGroups: Array.from({ length: numOfEggGroups }, (_, index) => allEggGroups[index]),
                }),
            ).rejects.toThrow('Fakemon must have 1-2 egg groups');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([1, 2])('should throw an error if provided %s invalid egg group(s)', async (numOfEggGroups) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');
            const eggGroups = Array.from({ length: numOfEggGroups }, () => 'INVALID' as PokemonEggGroup);

            // Act & Assert
            await expect(
                FakemonBreedingInformationManagerService.setEggGroups({
                    messageId,
                    fakemon,
                    eggGroups,
                }),
            ).rejects.toThrow(`Invalid egg groups: ${eggGroups.join(', ')}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if provided duplicate egg groups', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBreedingInformationManagerService.setEggGroups({
                    messageId,
                    fakemon,
                    eggGroups: [PokemonEggGroup.Bug, PokemonEggGroup.Bug],
                }),
            ).rejects.toThrow(`Cannot have duplicate egg groups`);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if provided both the None and another egg group', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBreedingInformationManagerService.setEggGroups({
                    messageId,
                    fakemon,
                    eggGroups: [PokemonEggGroup.None, PokemonEggGroup.Bug],
                }),
            ).rejects.toThrow(`Fakemon with the ${PokemonEggGroup.None} egg group cannot have a second egg group`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonBreedingInformationManagerService.setGenderRatio.name}`, () =>
    {
        it.each(genderRatioAndExpectedResultTuple)(`should update the fakemon's gender ratio to be '%s'`, async (genderRatio, expectedGenderRatioResult) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedFakemonResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedFakemonResult);

            // Act
            const result = await FakemonBreedingInformationManagerService.setGenderRatio({
                messageId,
                fakemon,
                genderRatio,
            });

            // Assert
            expect(result).toEqual(expectedFakemonResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    breedingInformation: {
                        ...fakemon.breedingInformation,
                        genderRatio: expectedGenderRatioResult,
                    },
                },
            );
        });

        it('should throw an error if provided an invalid gender ratio', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonBreedingInformationManagerService.setGenderRatio({
                    messageId,
                    fakemon,
                    genderRatio: 'INVALID' as PokemonGenderRatio,
                }),
            ).rejects.toThrow(`Invalid gender ratio: INVALID`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonBreedingInformationManagerService['adaptGenderRatio'].name}`, () =>
    {
        it.each(genderRatioAndExpectedResultTuple)(`should successfully adapt gender ratio '%s'`, (genderRatio, expectedResult) =>
        {
            // Act
            const result = FakemonBreedingInformationManagerService['adaptGenderRatio'](genderRatio);

            // Assert
            expect(result).toEqual(expectedResult);
        });

        it('should throw an error if provided an invalid gender ratio', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonBreedingInformationManagerService['adaptGenderRatio']('INVALID' as PokemonGenderRatio),
            ).toThrow('Invalid gender ratio: INVALID');
        });
    });
});
