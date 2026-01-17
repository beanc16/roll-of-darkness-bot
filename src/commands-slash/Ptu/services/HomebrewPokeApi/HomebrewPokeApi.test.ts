import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';

import { HomebrewPokeApi } from './HomebrewPokeApi.js';

// We don't want to log anything during these tests that would normally log
jest.mock('@beanc16/logger');

jest.mock('@beanc16/microservices-abstraction', () =>
{
    return {
        FileStorageMicroservice: {
            v1: {
                get: jest.fn(),
            },
        },
    };
});

describe('class: PokeApi', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe('method: getPokemonImageUrls', () =>
    {
        it('should return undefined if names is undefined', async () =>
        {
            const result = await HomebrewPokeApi.getPokemonImageUrls(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined if names is empty', async () =>
        {
            const result = await HomebrewPokeApi.getPokemonImageUrls([]);
            expect(result).toBeUndefined();
        });

        it('should not return image urls if response from api is empty', async () =>
        {
            jest.spyOn(FileStorageMicroservice.v1, 'get').mockResolvedValue({
                // @ts-expect-error -- This is necessary for mocking an error result
                data: null,
            });

            const names = ['Pikachu'];
            const result = await HomebrewPokeApi.getPokemonImageUrls(names);
            expect(result).toEqual([]);
        });

        it('should call getByNames and return image urls', async () =>
        {
            // @ts-expect-error -- Only include the necessary data for testing
            jest.spyOn(FileStorageMicroservice.v1, 'get').mockResolvedValueOnce({
                data: { url: 'https://example.com/pikachu.png' },
            // @ts-expect-error -- Only include the necessary data for testing
            }).mockResolvedValueOnce({
                data: { url: 'https://example.com/charizard.png' },
            });

            const names = ['Pikachu', 'Charizard'];
            const result = await HomebrewPokeApi.getPokemonImageUrls(names);

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

        it('should use unknown image url when promise is rejected', async () =>
        {
            jest.spyOn(FileStorageMicroservice.v1, 'get').mockRejectedValueOnce({
            }).mockRejectedValueOnce({
            });

            HomebrewPokeApi['unknownImageUrl'] = 'https://example.com/unknown.png';
            const names = ['Pikachu', 'Charizard'];
            const result = await HomebrewPokeApi.getPokemonImageUrls(names);

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
