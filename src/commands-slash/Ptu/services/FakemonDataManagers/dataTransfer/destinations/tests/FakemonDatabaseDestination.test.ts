/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { MongoDbResults } from 'mongodb-controller';

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../../dal/PtuController.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { createPtuPokemonCollectionData as createPtuPokemonCollectionDataOriginal } from '../../../../../fakes/PtuPokemonCollection.fakes.js';
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
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const insertOneIfNotExistsSpy = jest.spyOn(PokemonController, 'insertOneIfNotExists');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
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
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput');
            const insertOneIfNotExistsSpy = jest.spyOn(PokemonController, 'insertOneIfNotExists');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Pokemon name must not be empty');
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).toHaveBeenCalled();
            expect(insertOneIfNotExistsSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should not validate input, insert pokemon, or update transfer status if fakemon was already transferred', async () =>
        {
            // Arrange
            const input = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(true);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const insertOneIfNotExistsSpy = jest.spyOn(PokemonController, 'insertOneIfNotExists');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).not.toHaveBeenCalled();
            expect(insertOneIfNotExistsSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonDatabaseDestination.prototype['validateInput'].name}`, () =>
    {
        // Delegates logic to PtuPokemonCollection.validate
        it('should call PtuPokemonCollection.validate', () =>
        {
            // Arrange
            const validateSpy = jest.spyOn(PtuPokemonCollection, 'validate').mockReturnValue(undefined);
            const input = {} as PtuPokemonCollection;

            // Act
            const result = destination['validateInput'](input);

            // Act & Assert
            expect(result).toEqual(undefined);
            expect(validateSpy).toHaveBeenCalledTimes(1);
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
