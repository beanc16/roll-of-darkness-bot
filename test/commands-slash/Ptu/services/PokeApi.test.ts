import { PokeApi } from '../../../../src/commands-slash/Ptu/services/PokeApi.js';

jest.mock('pokedex-promise-v2', () =>
{
    return {
        __esmodule: true,
        default: jest.fn().mockImplementation(() =>
        {
            return {
                Pokedex: jest.fn().mockImplementation(() =>
                {
                    return {
                        getPokemonByName: jest.fn(),
                    };
                }),
            };
        }),
    };
});

describe('class: PokeApi', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe('method: parseName', () =>
    {
        it('should return undefined if name is undefined', () =>
        {
            const result = PokeApi.parseName(undefined);
            expect(result).toBeUndefined();
        });

        it('should parse name to lowercase', () =>
        {
            const name = 'Pikachu';
            const parsedName = PokeApi.parseName(name);
            expect(parsedName).toEqual('pikachu');
        });

        it('should replace special characters and spaces', () =>
        {
            const name = 'pikachu:.\' (pokémon)';
            const parsedName = PokeApi.parseName(name);
            expect(parsedName).toEqual('pikachu-pokemon');
        });

        it.each([
            ['alolan', 'alola'],
            ['galarian', 'galar'],
            ['hisuian', 'hisui'],
        ])('should replace variant name: "%s" with "%s"', (regionVariant, expectedRegionVariant) =>
        {
            const name = `Pikachu (${regionVariant})`;
            const parsedName = PokeApi.parseName(name);
            expect(parsedName).toEqual(`pikachu-${expectedRegionVariant}`);
        });

        it.each([
            ['aegislash', 'aegislash-blade'],
            ['basculin', 'basculin-red-striped'],
            ['calyrex-ice-rider', 'calyrex-ice'],
            ['calyrex-shadow-rider', 'calyrex-shadow'],
            ['darmanitan', 'darmanitan-standard'],
            ['darmanitan-galar', 'darmanitan-galar-standard'],
            ['darmanitan-galar-zen', 'darmanitan-galar-zen'],
            ['eiscue-ice-face', 'eiscue-ice'],
            ['eiscue-noice-face', 'eiscue-noice'],
            ['hoopa-confined', 'hoopa'],
            ['keldeo', 'keldeo-ordinary'],
            ['kyurem-zekrom', 'kyurem-black'],
            ['kyurem-reshiram', 'kyurem-white'],
            ['meloetta-step', 'meloetta-pirouette'],
            ['mimikyu', 'mimikyu-disguised'],
            ['minior-core', 'minior-red'],
            ['minior-meteor', 'minior-red-meteor'],
            ['morpeko', 'morpeko-full-belly'],
            ['necrozma-dawn-wings', 'necrozma-dawn'],
            ['necrozma-dusk-mane', 'necrozma-dusk'],
            ['nidoran-female', 'nidoran-f'],
            ['nidoran-male', 'nidoran-m'],
            ['oricorio', 'oricorio-baile'],
            ['wishiwashi', 'wishiwashi-solo'],
            ['wishiwashi-schooling', 'wishiwashi-school'],
            ['zacian-crowned-sword', 'zacian-crowned'],
            ['zamazenta-crowned-shield', 'zamazenta-crowned'],
            ['zacian-hero', 'zacian'],
            ['zamazenta-hero', 'zamazenta'],
            ['zygarde', 'zygarde-50'],
        ])('should replace specific pokemon: "%s" with "%s"', (pokemon, expectedPokemon) =>
        {
            const name = `${pokemon}`;
            const parsedName = PokeApi.parseName(name);
            expect(parsedName).toEqual(expectedPokemon);
        });
    });

    describe('method: getImageUrls', () =>
    {
        it('should return undefined if names is undefined', async () =>
        {
            const result = await PokeApi.getImageUrls(undefined);
            expect(result).toBeUndefined();
        });

        it('should not return image urls if response from api is empty', async () =>
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
            jest.spyOn(PokeApi as any, 'getByNames').mockImplementation(() => []);

            const names = ['Pikachu'];
            const result = await PokeApi.getImageUrls(names);
            expect(result).toEqual([]);
        });

        it('should not return image urls if "response.sprites" from api is undefined', async () =>
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
            jest.spyOn(PokeApi as any, 'getByNames').mockImplementation(() => [
                {
                    id: 25,
                    name: 'Pikachu',
                },
            ]);

            const names = ['Pikachu'];
            const result = await PokeApi.getImageUrls(names);
            expect(result).toEqual([]);
        });

        it('should not return image urls if "response.sprites.other" from api is undefined', async () =>
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
            jest.spyOn(PokeApi as any, 'getByNames').mockImplementation(() => [
                {
                    id: 25,
                    name: 'Pikachu',
                    sprites: {},
                },
            ]);

            const names = ['Pikachu'];
            const result = await PokeApi.getImageUrls(names);
            expect(result).toEqual([]);
        });

        it('should not return image urls if "response.sprites.other.official-artwork" from api is undefined', async () =>
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
            jest.spyOn(PokeApi as any, 'getByNames').mockImplementation(() => [
                {
                    id: 25,
                    name: 'Pikachu',
                    sprites: {
                        other: {},
                    },
                },
            ]);

            const names = ['Pikachu'];
            const result = await PokeApi.getImageUrls(names);
            expect(result).toEqual([]);
        });

        it('should call getByNames and return image urls', async () =>
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
            jest.spyOn(PokeApi as any, 'getByNames').mockImplementation(() => [
                {
                    id: 25,
                    name: 'Pikachu',
                    sprites: {
                        other: {
                            'official-artwork': {
                                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                            },
                        },
                    },
                },
                {
                    id: 6,
                    name: 'Charizard',
                    sprites: {
                        other: {
                            'official-artwork': {
                                front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
                            },
                        },
                    },
                },
            ]);

            const names = ['Pikachu', 'Charizard'];
            const result = await PokeApi.getImageUrls(names);

            expect(PokeApi['getByNames']).toHaveBeenCalledWith(names);
            expect(result).toEqual([
                {
                    id: 25,
                    name: 'Pikachu',
                    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                },
                {
                    id: 6,
                    name: 'Charizard',
                    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
                },
            ]);
        });
    });
});
