/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { faker } from '@faker-js/faker';

import { PtuFakemonCollection } from '../../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../../dal/PtuController.js';
import { createPtuFakemonAndPokemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { FakemonCollectionToPtuCollectionEditAdapter } from '../FakemonCollectionToPtuCollectionEditAdapter.js';

jest.mock('../../../../../dal/PtuController', () =>
{
    return {
        PokemonController: {
            getAll: jest.fn(),
        },
    };
});

describe(`class: ${FakemonCollectionToPtuCollectionEditAdapter.name}`, () =>
{
    let adapter: FakemonCollectionToPtuCollectionEditAdapter;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        adapter = new FakemonCollectionToPtuCollectionEditAdapter();
    });

    describe(`method: ${FakemonCollectionToPtuCollectionEditAdapter.prototype.transform.name}`, () =>
    {
        let editName: string;
        let pokemon: PtuPokemonCollection;
        let fakemon: PtuFakemonCollection;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- For jest mock
        let getAllPokemonSpy: any;

        beforeEach(() =>
        {
            editName = 'Homebrew Move List';

            const fakes = createPtuFakemonAndPokemonCollectionData({ editName });
            pokemon = fakes.pokemon;
            fakemon = fakes.fakemon;
            fakemon.editOfPokemonName = pokemon.name;
            getAllPokemonSpy = jest.spyOn(PokemonController, 'getAll');
        });

        describe('successful transformations', () =>
        {
            beforeEach(() =>
            {
                getAllPokemonSpy.mockResolvedValue({ results: [pokemon] });
            });

            it('should transform PtuFakemonCollection to FakemonCollectionToPtuCollectionEditAdapterOutput with a small diff', async () =>
            {
                // Arrange
                const diets = [faker.food.dish(), faker.food.dish(), faker.food.dish()];
                const habitats = [faker.location.state(), faker.location.state(), faker.location.state()];
                fakemon.diets = diets;
                fakemon.habitats = habitats;

                // Act
                const result = await adapter.transform(fakemon);

                // Assert
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(getAllPokemonSpy).toHaveBeenCalledWith({ name: fakemon.editOfPokemonName });
                expect(result).toBeDefined();
                expect(result).toEqual({
                    editName,
                    diets,
                    habitats,
                });
            });

            it('should transform PtuFakemonCollection to FakemonCollectionToPtuCollectionEditAdapterOutput with no diff', async () =>
            {
                // Act
                const result = await adapter.transform(fakemon);

                // Assert
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(getAllPokemonSpy).toHaveBeenCalledWith({ name: fakemon.editOfPokemonName });
                expect(result).toBeDefined();
                expect(result).toEqual({ editName });
            });

            it('should not include name in output', async () =>
            {
                // Arrange
                fakemon.name = faker.string.alpha();

                // Act
                const result = await adapter.transform(fakemon);

                // Assert
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeDefined();
                expect(result.name).toBeUndefined();
            });

            it('should not include versionName in output', async () =>
            {
                // Act
                const result = await adapter.transform(fakemon);

                // Assert
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeDefined();
                expect(result.versionName).toBeUndefined();
            });

            it('should not include olderVersions in output', async () =>
            {
                // Act
                const result = await adapter.transform(fakemon);

                // Assert
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeDefined();
                expect(result.olderVersions).toBeUndefined();
            });

            it('should not include metadata in output', async () =>
            {
                // Arrange
                fakemon.metadata = { source: faker.string.alpha() };

                // Act
                const result = await adapter.transform(fakemon);

                // Assert
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeDefined();
                expect(result.metadata).toBeUndefined();
            });

            it('should not include typeShifts in output', async () =>
            {
                // Arrange
                fakemon.typeShifts = [{ editName: faker.string.alpha() }, { editName: faker.string.alpha() }];

                // Act
                const result = await adapter.transform(fakemon);

                // Assert
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(result).toBeDefined();
                expect(result.typeShifts).toBeUndefined();
            });
        });

        describe('failed transformations', () =>
        {
            it.each([
                ['undefined', undefined],
                ['null', null],
                ['an empty string', ''],
            ])('should throw an error if pokemon is %s', async (_, value) =>
            {
                // Arrange
                fakemon.editName = value;
                getAllPokemonSpy.mockResolvedValue({ results: [value] });

                // Act & Assert
                await expect(() => adapter.transform(fakemon)).rejects.toThrow(`Edit name is not set`);
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(0);
            });

            it.each([
                ['undefined in an array', [undefined]],
                ['null in an array', [null]],
                ['an empty array', []],
                ['undefined', undefined],
            ])('should throw an error if pokemon is %s', async (_, value) =>
            {
                // Arrange
                getAllPokemonSpy.mockResolvedValue({ results: value });

                // Act & Assert
                await expect(() => adapter.transform(fakemon)).rejects.toThrow(`Pokemon "${fakemon.editOfPokemonName}" was not found`);
                expect(getAllPokemonSpy).toHaveBeenCalledTimes(1);
                expect(getAllPokemonSpy).toHaveBeenCalledWith({ name: fakemon.editOfPokemonName });
            });
        });
    });
});
