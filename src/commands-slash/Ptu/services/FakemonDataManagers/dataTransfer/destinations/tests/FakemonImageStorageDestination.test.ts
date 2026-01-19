/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { HomebrewPokeApi } from '../../../../HomebrewPokeApi/HomebrewPokeApi.js';
import { FakemonGeneralInformationManagerService } from '../../../FakemonGeneralInformationManagerService.js';
import { FakemonImageStorageDestination } from '../FakemonImageStorageDestination.js';

jest.mock('../../../../HomebrewPokeApi/HomebrewPokeApi', () =>
{
    return {
        HomebrewPokeApi: {
            getPokemonUrl: jest.fn(),
            getFakemonUrl: jest.fn(),
            transferFakemonImageToPokemon: jest.fn(),
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

describe(`class: ${FakemonImageStorageDestination.name}`, () =>
{
    let destination: FakemonImageStorageDestination;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        destination = new FakemonImageStorageDestination();
    });

    describe(`method: ${FakemonImageStorageDestination.prototype.create.name}`, () =>
    {
        it('should validate input, transfer image, and update transfer status', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput')
                .mockReturnValue(true);
            const getFakemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getFakemonUrl');
            const transferFakemonImageToPokemonSpy = jest.spyOn(HomebrewPokeApi, 'transferFakemonImageToPokemon');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).toHaveBeenCalledTimes(1);
            expect(validateInputSpy).toHaveBeenCalledWith(input);
            expect(getFakemonUrlSpy).toHaveBeenCalledTimes(1);
            expect(getFakemonUrlSpy).toHaveBeenCalledWith(source.name);
            expect(transferFakemonImageToPokemonSpy).toHaveBeenCalledTimes(1);
            expect(transferFakemonImageToPokemonSpy).toHaveBeenCalledWith(source.name);
            expect(updateTransferredToSpy).toHaveBeenCalledTimes(1);
            expect(updateTransferredToSpy).toHaveBeenCalledWith({
                fakemon: source,
                transferredTo: {
                    imageStorage: true,
                },
            });
        });

        it('should throw an error if validateInput fails', async () =>
        {
            // Arrange
            const input = undefined;
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput');
            const getFakemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getFakemonUrl');
            const transferFakemonImageToPokemonSpy = jest.spyOn(HomebrewPokeApi, 'transferFakemonImageToPokemon');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Url must be truthy');
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).toHaveBeenCalled();
            expect(getFakemonUrlSpy).not.toHaveBeenCalled();
            expect(transferFakemonImageToPokemonSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if getting fakemon url throws an error', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput');
            const getFakemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getFakemonUrl')
                .mockRejectedValueOnce(new Error('Fakemon image not found'));
            const transferFakemonImageToPokemonSpy = jest.spyOn(HomebrewPokeApi, 'transferFakemonImageToPokemon');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Fakemon image not found');
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).toHaveBeenCalled();
            expect(getFakemonUrlSpy).toHaveBeenCalled();
            expect(transferFakemonImageToPokemonSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if tranferring the image fails', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(false);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput');
            const getFakemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getFakemonUrl');
            const transferFakemonImageToPokemonSpy = jest.spyOn(HomebrewPokeApi, 'transferFakemonImageToPokemon')
                .mockRejectedValueOnce(new Error('Failed to transfer fakemon image to pokemon'));
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).rejects.toThrow('Failed to transfer fakemon image to pokemon');
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).toHaveBeenCalled();
            expect(getFakemonUrlSpy).toHaveBeenCalled();
            expect(transferFakemonImageToPokemonSpy).toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should not validate input, transfer image, or update transfer status if fakemon was already transferred', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const wasTransferredSpy = jest.spyOn(destination as unknown as { wasTransferred: jest.Mock }, 'wasTransferred')
                .mockReturnValue(true);
            const validateInputSpy = jest.spyOn(destination as unknown as { validateInput: jest.Mock }, 'validateInput');
            const getFakemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getFakemonUrl');
            const transferFakemonImageToPokemonSpy = jest.spyOn(HomebrewPokeApi, 'transferFakemonImageToPokemon');
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act & Assert
            await expect(
                destination.create(input, source),
            ).resolves.not.toThrow();
            expect(wasTransferredSpy).toHaveBeenCalledTimes(1);
            expect(wasTransferredSpy).toHaveBeenCalledWith(input, source);
            expect(validateInputSpy).not.toHaveBeenCalled();
            expect(getFakemonUrlSpy).not.toHaveBeenCalled();
            expect(transferFakemonImageToPokemonSpy).not.toHaveBeenCalled();
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonImageStorageDestination.prototype['validateInput'].name}`, () =>
    {
        it('should not throw an error if url is truthy', () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png' as unknown as Parameters<typeof destination['validateInput']>[0];

            // Act & Assert
            expect(() => destination['validateInput'](input)).not.toThrow();
        });

        it('should throw an error if url is falsy', () =>
        {
            // Arrange
            const input = undefined as unknown as Parameters<typeof destination['validateInput']>[0];

            // Act & Assert
            expect(() => destination['validateInput'](input)).toThrow('Url must be truthy');
        });
    });

    describe(`method: ${FakemonImageStorageDestination.prototype.wasTransferred.name}`, () =>
    {
        it('should return true if the url is not an empty string and the fakemon is marked as transferred to image storage', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.imageStorage = true;
            const getPokemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getPokemonUrl')
                .mockResolvedValue('https://example.com/pokemon-image.png');

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getPokemonUrlSpy).toHaveBeenCalledTimes(1);
            expect(getPokemonUrlSpy).toHaveBeenCalledWith(source.name);
            expect(result).toBe(true);
        });

        it('should return false if input is undefined', async () =>
        {
            // Arrange
            const input = undefined;
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const getPokemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getPokemonUrl')
                .mockResolvedValue('https://example.com/pokemon-image.png');

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getPokemonUrlSpy).toHaveBeenCalledTimes(0);
            expect(result).toBe(false);
        });

        it('should return false if retrieving the pokemon URL throws an error', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const getPokemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getPokemonUrl')
                .mockRejectedValueOnce(new Error('Failed to retrieve pokemon URL'));

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getPokemonUrlSpy).toHaveBeenCalledTimes(1);
            expect(getPokemonUrlSpy).toHaveBeenCalledWith(source.name);
            expect(result).toBe(false);
        });

        it('should return false if the pokemon URL is an empty string', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const getPokemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getPokemonUrl')
                .mockResolvedValue('');

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getPokemonUrlSpy).toHaveBeenCalledTimes(1);
            expect(getPokemonUrlSpy).toHaveBeenCalledWith(source.name);
            expect(result).toBe(false);
        });

        it('should return false if the fakemon is not marked as transferred to image storage', async () =>
        {
            // Arrange
            const input = 'https://example.com/fakemon-image.png';
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.imageStorage = false;
            const getPokemonUrlSpy = jest.spyOn(HomebrewPokeApi, 'getPokemonUrl')
                .mockResolvedValue('https://example.com/pokemon-image.png');

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getPokemonUrlSpy).toHaveBeenCalledTimes(1);
            expect(getPokemonUrlSpy).toHaveBeenCalledWith(source.name);
            expect(result).toBe(false);
        });
    });
});
