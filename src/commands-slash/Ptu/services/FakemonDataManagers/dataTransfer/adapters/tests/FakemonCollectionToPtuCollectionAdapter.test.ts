/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { FakemonDexNumberPrefix, FakemonGeneralInformationManagerService } from '../../../FakemonGeneralInformationManagerService.js';
import { FakemonCollectionToPtuCollectionAdapter } from '../FakemonCollectionToPtuCollectionAdapter.js';

jest.mock('../../../FakemonGeneralInformationManagerService', () =>
{
    const actual = jest.requireActual('../../../FakemonGeneralInformationManagerService');
    return {
        ...actual,
        FakemonGeneralInformationManagerService: {
            getCurrentMaxDexNumbers: jest.fn(),
        },
    };
});

describe(`class: ${FakemonCollectionToPtuCollectionAdapter.name}`, () =>
{
    let adapter: FakemonCollectionToPtuCollectionAdapter;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        adapter = new FakemonCollectionToPtuCollectionAdapter();
    });

    describe(`method: ${FakemonCollectionToPtuCollectionAdapter.prototype.transform.name}`, () =>
    {
        it.each([
            [PtuFakemonDexType.Eden, FakemonDexNumberPrefix.Eden],
            [PtuFakemonDexType.EdenParadox, FakemonDexNumberPrefix.EdenParadox],
            [PtuFakemonDexType.EdenDrained, FakemonDexNumberPrefix.EdenDrained],
            [PtuFakemonDexType.EdenLegendary, FakemonDexNumberPrefix.EdenLegendary],
        ])('should transform PtuFakemonCollection to PtuPokemonCollection with dexType %s', async (dexType, expectedPrefix) =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType });
            fakemon.moveList.zygardeCubeMoves = undefined;
            const maxDexNumber = 100;
            const getCurrentMaxDexNumbersSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'getCurrentMaxDexNumbers')
                .mockResolvedValue({
                    [FakemonDexNumberPrefix.Eden]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenParadox]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenDrained]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenLegendary]: maxDexNumber,
                });

            // Act
            const result = await adapter.transform(fakemon);

            // Assert
            expect(getCurrentMaxDexNumbersSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                _id: fakemon.id,
                name: fakemon.name,
                types: fakemon.types,
                baseStats: fakemon.baseStats,
                abilities: fakemon.abilities,
                evolution: fakemon.evolution,
                sizeInformation: fakemon.sizeInformation,
                breedingInformation: fakemon.breedingInformation,
                diets: fakemon.diets,
                habitats: fakemon.habitats,
                capabilities: fakemon.capabilities,
                skills: fakemon.skills,
                moveList: {
                    levelUp: fakemon.moveList.levelUp,
                    tmHm: fakemon.moveList.tmHm,
                    eggMoves: fakemon.moveList.eggMoves,
                    tutorMoves: fakemon.moveList.tutorMoves,
                    // zygardeCubeMoves should not be set at all
                },
                metadata: {
                    ...fakemon.metadata,
                    dexNumber: `${expectedPrefix}${maxDexNumber + 1}`,
                },
                megaEvolutions: fakemon.megaEvolutions,
                extras: fakemon.extras,
                edits: fakemon.edits,
            });
        });

        it('should use index parameter to calculate dex number for bulk transforms', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const maxDexNumber = 100;
            const index = 5;
            jest.spyOn(FakemonGeneralInformationManagerService, 'getCurrentMaxDexNumbers')
                .mockResolvedValue({
                    [FakemonDexNumberPrefix.Eden]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenParadox]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenDrained]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenLegendary]: maxDexNumber,
                });

            // Act
            const result = await adapter.transform(fakemon, index);

            // Assert
            expect(result.metadata.dexNumber).toBe(`${FakemonDexNumberPrefix.Eden}${maxDexNumber + index + 1}`);
        });

        it('should default index to 0 if not provided', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const maxDexNumber = 100;
            jest.spyOn(FakemonGeneralInformationManagerService, 'getCurrentMaxDexNumbers')
                .mockResolvedValue({
                    [FakemonDexNumberPrefix.Eden]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenParadox]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenDrained]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenLegendary]: maxDexNumber,
                });

            // Act
            const result = await adapter.transform(fakemon);

            // Assert
            expect(result.metadata.dexNumber).toBe(`${FakemonDexNumberPrefix.Eden}${maxDexNumber + 1}`);
        });

        it('should set edits to undefined if input edits is undefined', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            fakemon.edits = undefined;
            jest.spyOn(FakemonGeneralInformationManagerService, 'getCurrentMaxDexNumbers')
                .mockResolvedValue({
                    [FakemonDexNumberPrefix.Eden]: 100,
                    [FakemonDexNumberPrefix.EdenParadox]: 100,
                    [FakemonDexNumberPrefix.EdenDrained]: 100,
                    [FakemonDexNumberPrefix.EdenLegendary]: 100,
                });

            // Act
            const result = await adapter.transform(fakemon);

            // Assert
            expect(result.edits).toEqual(undefined);
        });
    });

    describe(`method: ${FakemonCollectionToPtuCollectionAdapter.prototype.transformBulk.name}`, () =>
    {
        // The unit tests for the parent Adapter class cover most cases.
        // Tests in this describe block should be specific to this adapter's implementation.

        it('should use index parameter to calculate dex numbers for bulk transforms', async () =>
        {
            // Arrange
            const fakemon1 = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const fakemon2 = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const fakemon3 = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const maxDexNumber = 100;
            jest.spyOn(FakemonGeneralInformationManagerService, 'getCurrentMaxDexNumbers')
                .mockResolvedValue({
                    [FakemonDexNumberPrefix.Eden]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenParadox]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenDrained]: maxDexNumber,
                    [FakemonDexNumberPrefix.EdenLegendary]: maxDexNumber,
                });

            // Act
            const results = await adapter.transformBulk([fakemon1, fakemon2, fakemon3]);

            // Assert
            expect(results[0].metadata.dexNumber).toBe(`${FakemonDexNumberPrefix.Eden}${maxDexNumber + 1}`);
            expect(results[1].metadata.dexNumber).toBe(`${FakemonDexNumberPrefix.Eden}${maxDexNumber + 2}`);
            expect(results[2].metadata.dexNumber).toBe(`${FakemonDexNumberPrefix.Eden}${maxDexNumber + 3}`);
        });
    });
});
