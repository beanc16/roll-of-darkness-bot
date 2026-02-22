import { FileStorageResourceType, FileStorageService } from '@beanc16/file-storage';

import { PtuFakemonDexType } from '../../dal/models/PtuFakemonCollection.js';
import { HomebrewPokeApi } from './HomebrewPokeApi.js';

describe('class: HomebrewPokeApi', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe('method: getPokemonUrl', () =>
    {
        it('should return file url', async () =>
        {
            const url = 'https://example.com/pikachu.png';
            jest.spyOn(FileStorageService, 'get')
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url });

            const result = await HomebrewPokeApi.getPokemonUrl('Pikachu', PtuFakemonDexType.Eden);
            expect(result).toEqual(url);
        });

        it('should throw an error if dex type does not map to a dex', async () =>
        {
            jest.spyOn(FileStorageService, 'get')
                .mockResolvedValueOnce(undefined);

            await expect(
                HomebrewPokeApi.getPokemonUrl('Pikachu', PtuFakemonDexType.EdenLegendary),
            ).rejects.toThrow(`Unsupported dex type for fetching images: ${PtuFakemonDexType.EdenLegendary}`);
        });

        it('should throw an error if file storage service returns undefined', async () =>
        {
            jest.spyOn(FileStorageService, 'get')
                .mockResolvedValueOnce(undefined);

            await expect(
                HomebrewPokeApi.getPokemonUrl('Pikachu', PtuFakemonDexType.Eden),
            ).rejects.toThrow('Pokemon image not found');
        });
    });

    describe('method: getFakemonUrl', () =>
    {
        it('should return file url', async () =>
        {
            const url = 'https://example.com/pikachu.png';
            jest.spyOn(FileStorageService, 'get')
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url });

            const result = await HomebrewPokeApi.getFakemonUrl('Pikachu');
            expect(result).toEqual(url);
        });

        it('should throw an error if file storage service returns undefined', async () =>
        {
            jest.spyOn(FileStorageService, 'get')
                .mockResolvedValueOnce(undefined);

            await expect(
                HomebrewPokeApi.getFakemonUrl('Pikachu'),
            ).rejects.toThrow('Fakemon image not found');
        });
    });

    describe('method: uploadFakemonImage', () =>
    {
        const mockAppId = 'test-app-id';

        beforeEach(() =>
        {
            process.env.APP_ID = mockAppId;
        });

        it('should upload image without deleting when isCreate is true', async () =>
        {
            const newUrl = 'https://example.com/new-fakemon.png';
            const deleteSpy = jest.spyOn(FileStorageService, 'delete');
            const uploadSpy = jest.spyOn(FileStorageService, 'upload')
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: newUrl });

            const result = await HomebrewPokeApi.uploadFakemonImage({
                speciesName: 'Fakemon1',
                imageUrl: 'https://example.com/source.png',
                isCreate: true,
            });

            expect(deleteSpy).not.toHaveBeenCalled();
            expect(uploadSpy).toHaveBeenCalledWith({
                appId: mockAppId,
                file: {
                    fileName: 'Fakemon1',
                    url: 'https://example.com/source.png',
                },
                nestedFolders: HomebrewPokeApi['fakemonNestedFolders'],
                resourceType: FileStorageResourceType.Image,
            });
            expect(result).toEqual(newUrl);
        });

        it('should delete old image then upload when isCreate is false', async () =>
        {
            const oldUrl = 'https://example.com/source.png';
            const newUrl = 'https://example.com/updated-fakemon.png';
            const deleteSpy = jest.spyOn(FileStorageService, 'delete')
                .mockResolvedValueOnce({ result: oldUrl });
            const uploadSpy = jest.spyOn(FileStorageService, 'upload')
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: newUrl });

            const result = await HomebrewPokeApi.uploadFakemonImage({
                speciesName: 'Fakemon2',
                imageUrl: newUrl,
                isCreate: false,
            });

            expect(deleteSpy).toHaveBeenCalledWith({
                appId: mockAppId,
                fileName: 'Fakemon2',
                nestedFolders: HomebrewPokeApi['fakemonNestedFolders'],
                resourceType: FileStorageResourceType.Image,
            });
            expect(uploadSpy).toHaveBeenCalledWith({
                appId: mockAppId,
                file: {
                    fileName: 'Fakemon2',
                    url: newUrl,
                },
                nestedFolders: HomebrewPokeApi['fakemonNestedFolders'],
                resourceType: FileStorageResourceType.Image,
            });
            expect(result).toEqual(newUrl);
        });

        it('should continue to upload even if delete fails when isCreate is false', async () =>
        {
            const newUrl = 'https://example.com/fakemon-after-failed-delete.png';
            const deleteSpy = jest.spyOn(FileStorageService, 'delete')
                .mockRejectedValueOnce(new Error('Delete failed'));
            const uploadSpy = jest.spyOn(FileStorageService, 'upload')
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: newUrl });

            const result = await HomebrewPokeApi.uploadFakemonImage({
                speciesName: 'Fakemon3',
                imageUrl: 'https://example.com/source.png',
                isCreate: false,
            });

            expect(deleteSpy).toHaveBeenCalled();
            expect(uploadSpy).toHaveBeenCalled();
            expect(result).toEqual(newUrl);
        });

        it('should return undefined if upload fails', async () =>
        {
            jest.spyOn(FileStorageService, 'upload')
                .mockRejectedValueOnce(new Error('Upload failed'));

            const result = await HomebrewPokeApi.uploadFakemonImage({
                speciesName: 'Fakemon4',
                imageUrl: 'https://example.com/source.png',
                isCreate: true,
            });

            expect(result).toBeUndefined();
        });

        it('should return undefined if upload fails after successful delete', async () =>
        {
            jest.spyOn(FileStorageService, 'delete')
                .mockResolvedValueOnce({ result: 'https://example.com/old-fakemon.png' });
            jest.spyOn(FileStorageService, 'upload')
                .mockRejectedValueOnce(new Error('Upload failed'));

            const result = await HomebrewPokeApi.uploadFakemonImage({
                speciesName: 'Fakemon5',
                imageUrl: 'https://example.com/source.png',
                isCreate: false,
            });

            expect(result).toBeUndefined();
        });
    });

    describe('method: getPokemonImageUrls', () =>
    {
        it('should return undefined if all parameters are undefined', async () =>
        {
            const result = await HomebrewPokeApi.getPokemonImageUrls({});
            expect(result).toBeUndefined();
        });

        it('should return undefined if some names are empty and others are undefined', async () =>
        {
            const result = await HomebrewPokeApi.getPokemonImageUrls({
                edenNames: [],
            });
            expect(result).toBeUndefined();
        });

        it('should return undefined if all names are empty', async () =>
        {
            const result = await HomebrewPokeApi.getPokemonImageUrls({
                edenNames: [],
                meridiaNames: [],
                magalamNames: [],
            });
            expect(result).toBeUndefined();
        });

        it('should not return image urls if response from api is empty', async () =>
        {
            jest.spyOn(FileStorageService, 'get').mockResolvedValue({
                // @ts-expect-error -- This is necessary for mocking an error result
                data: null,
            });

            const names = ['Pikachu'];
            const result = await HomebrewPokeApi.getPokemonImageUrls({
                edenNames: names,
            });
            expect(result).toEqual([]);
        });

        it('should call getByNames and return image urls', async () =>
        {
            jest.spyOn(FileStorageService, 'get')
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: 'https://example.com/pikachu.png' })
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: 'https://example.com/charizard.png' });

            const names = ['Pikachu', 'Charizard'];
            const result = await HomebrewPokeApi.getPokemonImageUrls({
                edenNames: names,
            });

            expect(result).toEqual([
                {
                    name: 'Pikachu',
                    imageUrl: 'https://example.com/pikachu.png',
                },
                {
                    name: 'Charizard',
                    imageUrl: 'https://example.com/charizard.png',
                },
            ]);
        });

        it('should call getByNames and return image urls with all name arrays', async () =>
        {
            jest.spyOn(FileStorageService, 'get')
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: 'https://example.com/pikachu.png' })
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: 'https://example.com/charizard.png' })
                // @ts-expect-error -- Only include the necessary data for testing
                .mockResolvedValueOnce({ url: 'https://example.com/blastoise.png' });

            const result = await HomebrewPokeApi.getPokemonImageUrls({
                edenNames: ['Pikachu'],
                meridiaNames: ['Charizard'],
                magalamNames: ['Blastoise'],
            });

            expect(result).toEqual([
                {
                    name: 'Pikachu',
                    imageUrl: 'https://example.com/pikachu.png',
                },
                {
                    name: 'Charizard',
                    imageUrl: 'https://example.com/charizard.png',
                },
                {
                    name: 'Blastoise',
                    imageUrl: 'https://example.com/blastoise.png',
                },
            ]);
        });

        it('should use unknown image url when promise is rejected', async () =>
        {
            jest.spyOn(FileStorageService, 'get')
                .mockRejectedValueOnce({})
                .mockRejectedValueOnce({});

            HomebrewPokeApi['unknownImageUrl'] = 'https://example.com/unknown.png';
            const names = ['Pikachu', 'Charizard'];
            const result = await HomebrewPokeApi.getPokemonImageUrls({
                edenNames: names,
            });

            expect(result).toEqual([
                {
                    name: 'Pikachu',
                    imageUrl: 'https://example.com/unknown.png',
                },
                {
                    name: 'Charizard',
                    imageUrl: 'https://example.com/unknown.png',
                },
            ]);
        });
    });
});
