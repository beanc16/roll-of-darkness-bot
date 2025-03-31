import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';

import { HomebrewPokeApi } from '../../../../src/commands-slash/Ptu/services/HomebrewPokeApi.js';

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

    describe('method: getImageUrls', () =>
    {
        it('should return undefined if names is undefined', async () =>
        {
            const result = await HomebrewPokeApi.getImageUrls(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined if names is empty', async () =>
        {
            const result = await HomebrewPokeApi.getImageUrls([]);
            expect(result).toBeUndefined();
        });

        it('should not return image urls if response from api is empty', async () =>
        {
            jest.spyOn(FileStorageMicroservice.v1, 'get').mockResolvedValue({
                // @ts-expect-error -- This is necessary for mocking an error result
                data: null,
            });

            const names = ['Pikachu'];
            const result = await HomebrewPokeApi.getImageUrls(names);
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
            const result = await HomebrewPokeApi.getImageUrls(names);

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
    });
});
