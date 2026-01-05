/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { MongoDbResults } from 'mongodb-controller';

import { PtuFakemonDexType, PtuFakemonStatus } from '../../../dal/models/PtuFakemonCollection.js';
import { PokemonController } from '../../../dal/PtuController.js';
import { FakemonController } from '../../../dal/PtuFakemonController.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes.js';
import { FakemonDexNumberPrefix, FakemonGeneralInformationManagerService } from '../FakemonGeneralInformationManagerService.js';

jest.mock('../../../dal/PtuController', () =>
{
    return {
        PokemonController: {
            aggregate: jest.fn(),
        },
    };
});

jest.mock('../../../dal/PtuFakemonPseudoCache', () =>
{
    return {
        PtuFakemonPseudoCache: {
            update: jest.fn(),
        },
    };
});

jest.mock('../../../dal/PtuFakemonController', () =>
{
    return {
        FakemonController: {
            findOneAndUpdate: jest.fn(),
        },
    };
});

describe(`class: ${FakemonGeneralInformationManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${FakemonGeneralInformationManagerService.updateSpeciesName.name}`, () =>
    {
        it('should update species name', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const name = 'New Species Name';
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateSpeciesName({
                messageId,
                fakemon,
                name,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { name },
            );
        });

        it('should throw an error if name is empty', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const name = '';
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonGeneralInformationManagerService.updateSpeciesName({
                    messageId,
                    fakemon,
                    name,
                }),
            ).rejects.toThrow('Fakemon name cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if name is only whitespace', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const name = '   ';
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonGeneralInformationManagerService.updateSpeciesName({
                    messageId,
                    fakemon,
                    name,
                }),
            ).rejects.toThrow('Fakemon name cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonGeneralInformationManagerService.updateStatus.name}`, () =>
    {
        it('should update status using PtuFakemonPseudoCache when messageId is provided', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const status = PtuFakemonStatus.READY_FOR_REVIEW;
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate');

            // Act
            const result = await FakemonGeneralInformationManagerService.updateStatus({
                messageId,
                fakemon,
                status,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                { status },
            );
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it('should update status using FakemonController when messageId is not provided', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const status = PtuFakemonStatus.PASSED_REVIEW;
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateStatus({
                fakemon,
                status,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: fakemon.id },
                { status },
            );
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if status is invalid', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const status = 'InvalidStatus' as PtuFakemonStatus;
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate');

            // Act & Assert
            await expect(
                FakemonGeneralInformationManagerService.updateStatus({
                    messageId,
                    fakemon,
                    status,
                }),
            ).rejects.toThrow('Invalid status: InvalidStatus');
            expect(updateSpy).not.toHaveBeenCalled();
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it.each(
            Object.values(PtuFakemonStatus),
        )('should not throw an error for valid status %s', async (status) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act & Assert
            await expect(
                FakemonGeneralInformationManagerService.updateStatus({
                    messageId,
                    fakemon,
                    status,
                }),
            ).resolves.not.toThrow();
            expect(updateSpy).toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonGeneralInformationManagerService.updateTransferredTo.name}`, () =>
    {
        it('should update ptuDatabase transfer status', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const transferredTo = { ptuDatabase: true };
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateTransferredTo({
                fakemon,
                transferredTo,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: fakemon.id },
                {
                    'transferredTo.ptuDatabase': true,
                },
            );
        });

        it('should update imageStorage transfer status', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const transferredTo = { imageStorage: true };
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateTransferredTo({
                fakemon,
                transferredTo,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: fakemon.id },
                {
                    'transferredTo.imageStorage': true,
                },
            );
        });

        it('should update googleSheets.pokemonData transfer status', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const transferredTo = { googleSheets: { pokemonData: true } };
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateTransferredTo({
                fakemon,
                transferredTo,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: fakemon.id },
                {
                    'transferredTo.googleSheets.pokemonData': true,
                },
            );
        });

        it('should update googleSheets.pokemonSkills transfer status', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const transferredTo = { googleSheets: { pokemonSkills: true } };
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateTransferredTo({
                fakemon,
                transferredTo,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: fakemon.id },
                {
                    'transferredTo.googleSheets.pokemonSkills': true,
                },
            );
        });

        it('should update multiple transfer statuses at once', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const transferredTo = {
                ptuDatabase: true,
                imageStorage: true,
                googleSheets: {
                    pokemonData: true,
                    pokemonSkills: true,
                },
            };
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateTransferredTo({
                fakemon,
                transferredTo,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: fakemon.id },
                {
                    'transferredTo.ptuDatabase': true,
                    'transferredTo.imageStorage': true,
                    'transferredTo.googleSheets.pokemonData': true,
                    'transferredTo.googleSheets.pokemonSkills': true,
                },
            );
        });

        it('should preserve existing transfer statuses when updating new ones', async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            fakemon.transferredTo = {
                ptuDatabase: true,
                imageStorage: false,
                googleSheets: {
                    pokemonData: true,
                    pokemonSkills: false,
                },
            };
            const transferredTo = { imageStorage: true };
            const expectedResult = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const findOneAndUpdateSpy = jest.spyOn(FakemonController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.updateTransferredTo({
                fakemon,
                transferredTo,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: fakemon.id },
                {
                    'transferredTo.imageStorage': true,
                },
            );
        });
    });

    describe(`method: ${FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers.name}`, () =>
    {
        it('should return max dex numbers for all prefixes', async () =>
        {
            // Arrange
            const aggregateSpy = jest.spyOn(PokemonController, 'aggregate')
                .mockResolvedValue({
                    results: [
                        { prefix: FakemonDexNumberPrefix.Eden, maxNumber: 100 },
                        { prefix: FakemonDexNumberPrefix.EdenParadox, maxNumber: 50 },
                        { prefix: FakemonDexNumberPrefix.EdenDrained, maxNumber: 25 },
                        { prefix: FakemonDexNumberPrefix.EdenLegendary, maxNumber: 10 },
                    ],
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers();

            // Assert
            expect(aggregateSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                [FakemonDexNumberPrefix.Eden]: 100,
                [FakemonDexNumberPrefix.EdenParadox]: 50,
                [FakemonDexNumberPrefix.EdenDrained]: 25,
                [FakemonDexNumberPrefix.EdenLegendary]: 10,
            });
        });

        it('should return empty object if no results', async () =>
        {
            // Arrange
            const aggregateSpy = jest.spyOn(PokemonController, 'aggregate')
                .mockResolvedValue({
                    results: [],
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers();

            // Assert
            expect(aggregateSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({});
        });

        it('should return empty object if results is undefined', async () =>
        {
            // Arrange
            const aggregateSpy = jest.spyOn(PokemonController, 'aggregate')
                .mockResolvedValue({
                    results: undefined,
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers();

            // Assert
            expect(aggregateSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({});
        });

        it('should handle partial results with only some prefixes', async () =>
        {
            // Arrange
            const aggregateSpy = jest.spyOn(PokemonController, 'aggregate')
                .mockResolvedValue({
                    results: [
                        { prefix: FakemonDexNumberPrefix.Eden, maxNumber: 100 },
                        { prefix: FakemonDexNumberPrefix.EdenParadox, maxNumber: 50 },
                    ],
                } as MongoDbResults);

            // Act
            const result = await FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers();

            // Assert
            expect(aggregateSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                [FakemonDexNumberPrefix.Eden]: 100,
                [FakemonDexNumberPrefix.EdenParadox]: 50,
            });
        });

        it('should call aggregate with correct pipeline', async () =>
        {
            // Arrange
            const aggregateSpy = jest.spyOn(PokemonController, 'aggregate')
                .mockResolvedValue({
                    results: [],
                } as MongoDbResults);

            // Act
            await FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers();

            // Assert
            expect(aggregateSpy).toHaveBeenCalledWith(
                [
                    {
                        $match: {
                            'metadata.dexNumber': { $regex: /^#/ },
                        },
                    },
                    {
                        $set: {
                            parsed: {
                                $regexFind: {
                                    input: '$metadata.dexNumber',
                                    regex: /^(#[A-Z]*)(\d+)/,
                                },
                            },
                        },
                    },
                    {
                        $match: {
                            'parsed.captures': { $ne: null },
                        },
                    },
                    {
                        $set: {
                            prefix: { $arrayElemAt: ['$parsed.captures', 0] },
                            number: {
                                $toInt: { $arrayElemAt: ['$parsed.captures', 1] },
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$prefix',
                            maxNumber: { $max: '$number' },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            prefix: '$_id',
                            maxNumber: 1,
                        },
                    },
                    {
                        $sort: { prefix: 1 },
                    },
                ],
                expect.objectContaining({
                    Model: expect.any(Function),
                }),
            );
        });
    });
});
