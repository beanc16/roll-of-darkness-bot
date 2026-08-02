/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { MongoDbResults } from 'mongodb-controller';

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../../dal/PtuController.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { createPtuPokemonCollectionData } from '../../../../../fakes/PtuPokemonCollection.fakes.js';
import { FakemonGeneralInformationManagerService } from '../../../FakemonGeneralInformationManagerService.js';
import { FakemonCollectionToPtuCollectionEditAdapterOutput } from '../../adapters/FakemonCollectionToPtuCollectionEditAdapter.js';
import { FakemonDatabaseEditDestination } from '../FakemonDatabaseEditDestination.js';

jest.mock('../../../../../dal/PtuController', () =>
{
    return {
        PokemonController: {
            findOneAndUpdate: jest.fn(),
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

const createAdapterData = (): FakemonCollectionToPtuCollectionEditAdapterOutput =>
{
    const result = createPtuPokemonCollectionData();
    return {
        editName: result.name,
        types: result.types,
        baseStats: result.baseStats,
        abilities: result.abilities,
        evolution: result.evolution,
        sizeInformation: result.sizeInformation,
        breedingInformation: result.breedingInformation,
        diets: result.diets,
        habitats: result.habitats,
        capabilities: result.capabilities,
        skills: result.skills,
        moveList: result.moveList,
        metadata: result.metadata,
        megaEvolutions: result.megaEvolutions,
        extras: result.extras,
    };
};

describe(`class: ${FakemonDatabaseEditDestination.name}`, () =>
{
    let destination: FakemonDatabaseEditDestination;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        destination = new FakemonDatabaseEditDestination();
    });

    describe(`method: ${FakemonDatabaseEditDestination.prototype.create.name}`, () =>
    {
        it.each([
            [undefined, undefined],
            [0, []],
            [1, [createAdapterData()]],
            [2, [createAdapterData(), createAdapterData()]],
            [3, [createAdapterData(), createAdapterData(), createAdapterData()]],
        ])('should validate input, update pokemon, and update transfer status with %s existing edits', async (_, existingEdits) =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            pokemon.edits = existingEdits;
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.editOfPokemonName = pokemon.name;
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [pokemon] } as MongoDbResults);
            const findOneAndUpdateSpy = jest.spyOn(PokemonController, 'findOneAndUpdate');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).toHaveBeenCalledTimes(1);
            expect(validateInputSpy).toHaveBeenCalledWith(input, pokemon);
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(getAllSpy).toHaveBeenCalledWith({ name: source.editOfPokemonName });
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { name: source.editOfPokemonName },
                {
                    edits: [
                        ...(existingEdits ?? []),
                        input,
                    ],
                },
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
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            pokemon.edits = [];
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.editOfPokemonName = pokemon.name;
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockImplementation(() =>
                {
                    throw new Error('Pokemon name must not be empty');
                });
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [pokemon] } as MongoDbResults);
            const findOneAndUpdateSpy = jest.spyOn(PokemonController, 'findOneAndUpdate');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Pokemon name must not be empty');
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).toHaveBeenCalled();
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(getAllSpy).toHaveBeenCalledWith({ name: source.editOfPokemonName });
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should not validate input, update pokemon, or update transfer status if fakemon was already transferred', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            pokemon.edits = [];
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(true);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [pokemon] } as MongoDbResults);
            const findOneAndUpdateSpy = jest.spyOn(PokemonController, 'findOneAndUpdate');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).not.toHaveBeenCalled();
            expect(getAllSpy).not.toHaveBeenCalled();
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if fakemon.editName is not set', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            pokemon.edits = [];
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = undefined;
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [pokemon] } as MongoDbResults);
            const findOneAndUpdateSpy = jest.spyOn(PokemonController, 'findOneAndUpdate');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Edit name is not set for fakemon');
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).not.toHaveBeenCalled();
            expect(getAllSpy).not.toHaveBeenCalled();
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if fakemon.editOfPokemonName is not set', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            pokemon.edits = [];
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.editOfPokemonName = undefined;
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [pokemon] } as MongoDbResults);
            const findOneAndUpdateSpy = jest.spyOn(PokemonController, 'findOneAndUpdate');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Edit of pokemon name is not set for fakemon');
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).not.toHaveBeenCalled();
            expect(getAllSpy).not.toHaveBeenCalled();
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if fakemon.editOfPokemonName is set but the corresponding pokemon cannot be found', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            pokemon.edits = [];
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.editOfPokemonName = pokemon.name;
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [] } as MongoDbResults);
            const findOneAndUpdateSpy = jest.spyOn(PokemonController, 'findOneAndUpdate');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow(`Pokemon "${source.editOfPokemonName}" does not exist`);
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).not.toHaveBeenCalled();
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(getAllSpy).toHaveBeenCalledWith({ name: source.editOfPokemonName });
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if fakemon.editOfPokemonName is set but results are undefined', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            pokemon.edits = [];
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.editOfPokemonName = pokemon.name;
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: undefined } as MongoDbResults);
            const findOneAndUpdateSpy = jest.spyOn(PokemonController, 'findOneAndUpdate');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow(`Pokemon "${source.editOfPokemonName}" does not exist`);
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).not.toHaveBeenCalled();
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(getAllSpy).toHaveBeenCalledWith({ name: source.editOfPokemonName });
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonDatabaseEditDestination.prototype['validateInput'].name}`, () =>
    {
        // Delegates logic to PtuPokemonCollection.validate
        it('should call PtuPokemonCollection.validate', () =>
        {
            // Arrange
            const validateSpy = jest.spyOn(PtuPokemonCollection, 'validate').mockReturnValue(undefined);
            const input = {} as FakemonCollectionToPtuCollectionEditAdapterOutput;
            const pokemon = createPtuPokemonCollectionData();

            // Act
            const result = destination['validateInput'](input, pokemon);

            // Act & Assert
            expect(result).toEqual(undefined);
            expect(validateSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe(`method: ${FakemonDatabaseEditDestination.prototype.wasTransferred.name}`, () =>
    {
        it('should return true if edit of pokemon exists in database and source was transferred to ptu database', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.transferredTo.ptuDatabase = true;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [{ ...pokemon, edits: [input] }] } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(getAllSpy).toHaveBeenCalledWith({
                edits: { $elemMatch: { editName: source.editName } },
            });
            expect(result).toBe(true);
        });

        it('should return false if edit of pokemon exists in database but source was not transferred to ptu database', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const pokemon = createPtuPokemonCollectionData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.transferredTo.ptuDatabase = false;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: [{ ...pokemon, edits: [input] }] } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if edit of pokemon does not exist in database but source says it was transferred to ptu database', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
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
            const input = createAdapterData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
            source.transferredTo.ptuDatabase = true;
            const getAllSpy = jest.spyOn(PokemonController, 'getAll')
                .mockResolvedValue({ results: undefined } as MongoDbResults);

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getAllSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if edit of pokemon does not exist in database and source was not transferred', async () =>
        {
            // Arrange
            const input = createAdapterData();
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.editName = input.editName;
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
