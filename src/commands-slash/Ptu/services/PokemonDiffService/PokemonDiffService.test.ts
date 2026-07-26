import { PtuPokemonCollection } from '../../dal/models/PtuPokemonCollection.js';
import { createPtuPokemonCollectionData } from '../../fakes/PtuPokemonCollection.fakes.js';
import {
    PokemonDiet,
    PokemonEggGroup,
    PokemonHabitat,
    PokemonType,
} from '../../types/pokemon.js';
import { PokemonDiffService } from './PokemonDiffService.js';

describe(`class: ${PokemonDiffService.name}`, () =>
{
    describe(`method: ${PokemonDiffService.getDifference.name}`, () =>
    {
        it('should return an empty object when both pokemon are identical', () =>
        {
            // Arrange
            const pokemon = createPtuPokemonCollectionData();

            // Act
            const result = PokemonDiffService.getDifference({ originalPokemon: pokemon, newPokemon: pokemon });

            // Assert
            expect(result).toEqual({});
        });

        describe('field: name', () =>
        {
            it('should include name in diff when name differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = { ...originalPokemon, name: 'Different Name' };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ name: newPokemon.name });
            });
        });

        describe('field: types', () =>
        {
            it('should include types in diff when type content differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ types: [PokemonType.Fire] });
                const newPokemon = { ...originalPokemon, types: [PokemonType.Water] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ types: newPokemon.types });
            });

            it('should include types in diff when type count differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ types: [PokemonType.Fire] });
                const newPokemon = { ...originalPokemon, types: [PokemonType.Fire, PokemonType.Water] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ types: newPokemon.types });
            });
        });

        describe('field: baseStats', () =>
        {
            it.each([
                { stat: 'hp' },
                { stat: 'attack' },
                { stat: 'defense' },
                { stat: 'specialAttack' },
                { stat: 'specialDefense' },
                { stat: 'speed' },
            ])('should include baseStats in diff when $stat differs', ({ stat }) =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = {
                    ...originalPokemon,
                    baseStats: {
                        ...originalPokemon.baseStats,
                        [stat]: originalPokemon.baseStats[stat as keyof typeof originalPokemon.baseStats] + 1,
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ baseStats: newPokemon.baseStats });
            });
        });

        describe('field: abilities', () =>
        {
            const baseAbilities: PtuPokemonCollection['abilities'] = {
                basicAbilities: ['Blaze'],
                advancedAbilities: ['Solar Power'],
                highAbility: 'Drought',
            };

            it.each([
                { field: 'basicAbilities', value: ['Torrent'] },
                { field: 'advancedAbilities', value: ['Unburden'] },
                { field: 'highAbility', value: 'Adaptability' },
            ])('should include abilities in diff when $field differs', ({ field, value }) =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ abilities: baseAbilities });
                const newPokemon = {
                    ...originalPokemon,
                    abilities: {
                        ...baseAbilities,
                        [field]: value,
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ abilities: newPokemon.abilities });
            });
        });

        describe('field: evolution', () =>
        {
            it('should include evolution in diff when evolution differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = {
                    ...originalPokemon,
                    evolution: [{
                        name: 'Different', level: 1, stage: 1,
                    }],
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ evolution: newPokemon.evolution });
            });

            it('should include evolution in diff when evolution is added', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({
                    evolution: [{
                        name: 'First', level: 1, stage: 1,
                    }],
                });
                const newPokemon = {
                    ...originalPokemon,
                    evolution: [...originalPokemon.evolution, {
                        name: 'Second', level: 2, stage: 2,
                    }],
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ evolution: newPokemon.evolution });
            });

            it('should include evolution in diff when evolution is removed', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({
                    evolution: [
                        {
                            name: 'First', level: 1, stage: 1,
                        },
                        {
                            name: 'Second', level: 2, stage: 2,
                        },
                    ],
                });
                const newPokemon = {
                    ...originalPokemon,
                    evolution: [originalPokemon.evolution[0]],
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ evolution: newPokemon.evolution });
            });

            it.each([
                'Bonsly',
                'Sudowoodo',
                'Porygon',
                'Porygon2',
                'Porygon-Z',
            ])(
                'should not include evolution in diff when original pokemon is %s regardless of evolution differences',
                (name) =>
                {
                    // Arrange
                    const originalPokemon = createPtuPokemonCollectionData({
                        name,
                        evolution: [{
                            name, level: 1, stage: 1,
                        }],
                    });
                    const newPokemon = {
                        ...originalPokemon,
                        evolution: [{
                            name: 'Totally Different', level: 99, stage: 99,
                        }],
                    };

                    // Act
                    const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                    // Assert
                    expect(result.evolution).toBeUndefined();
                },
            );
        });

        describe('field: sizeInformation', () =>
        {
            it.each([
                {
                    subField: 'height', field: 'freedom', value: `9'9"`,
                },
                {
                    subField: 'height', field: 'metric', value: '9.9m',
                },
                {
                    subField: 'height', field: 'ptu', value: 'Titanic',
                },
                {
                    subField: 'weight', field: 'freedom', value: '999lb',
                },
                {
                    subField: 'weight', field: 'metric', value: '999kg',
                },
                {
                    subField: 'weight', field: 'ptu', value: 9,
                },
            ] as const)('should include sizeInformation in diff when $subField.$field differs', ({
                subField,
                field,
                value,
            }) =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = {
                    ...originalPokemon,
                    sizeInformation: {
                        ...originalPokemon.sizeInformation,
                        [subField]: {
                            ...originalPokemon.sizeInformation[subField],
                            [field]: value,
                        },
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ sizeInformation: newPokemon.sizeInformation });
            });
        });

        describe('field: breedingInformation', () =>
        {
            const baseBreeding: PtuPokemonCollection['breedingInformation'] = {
                genderRatio: { male: 50, female: 50 },
                eggGroups: [PokemonEggGroup.Amorphous],
                averageHatchRate: '10 Days',
            };

            it('should include breedingInformation in diff when genderRatio.male differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ breedingInformation: baseBreeding });
                const newPokemon = {
                    ...originalPokemon,
                    breedingInformation: {
                        ...baseBreeding,
                        genderRatio: { male: 75, female: 25 },
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ breedingInformation: newPokemon.breedingInformation });
            });

            it('should include breedingInformation in diff when genderRatio changes to genderless', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ breedingInformation: baseBreeding });
                const newPokemon = {
                    ...originalPokemon,
                    breedingInformation: {
                        ...baseBreeding,
                        genderRatio: { none: true },
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ breedingInformation: newPokemon.breedingInformation });
            });

            it('should include breedingInformation in diff when eggGroups differ', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ breedingInformation: baseBreeding });
                const newPokemon = {
                    ...originalPokemon,
                    breedingInformation: {
                        ...baseBreeding,
                        eggGroups: [PokemonEggGroup.Monster],
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ breedingInformation: newPokemon.breedingInformation });
            });

            it('should include breedingInformation in diff when averageHatchRate differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ breedingInformation: baseBreeding });
                const newPokemon = {
                    ...originalPokemon,
                    breedingInformation: {
                        ...baseBreeding,
                        averageHatchRate: '20 Days',
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ breedingInformation: newPokemon.breedingInformation });
            });
        });

        describe('field: diets', () =>
        {
            it('should include diets in diff when diet content differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ diets: [PokemonDiet.Carnivore] });
                const newPokemon = { ...originalPokemon, diets: [PokemonDiet.Herbivore] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ diets: newPokemon.diets });
            });

            it('should include diets in diff when diet count differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ diets: [PokemonDiet.Carnivore] });
                const newPokemon = { ...originalPokemon, diets: [PokemonDiet.Carnivore, PokemonDiet.Herbivore] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ diets: newPokemon.diets });
            });
        });

        describe('field: habitats', () =>
        {
            it('should include habitats in diff when habitat content differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ habitats: [PokemonHabitat.Forest] });
                const newPokemon = { ...originalPokemon, habitats: [PokemonHabitat.Mountain] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ habitats: newPokemon.habitats });
            });

            it('should include habitats in diff when habitat count differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ habitats: [PokemonHabitat.Forest] });
                const newPokemon = { ...originalPokemon, habitats: [PokemonHabitat.Forest, PokemonHabitat.Mountain] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ habitats: newPokemon.habitats });
            });
        });

        describe('field: capabilities', () =>
        {
            it.each([
                'overland',
                'swim',
                'sky',
                'levitate',
                'burrow',
                'highJump',
                'lowJump',
                'power',
            ] as const)('should include capabilities in diff when %s differs', (capability) =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = {
                    ...originalPokemon,
                    capabilities: { ...originalPokemon.capabilities, [capability]: 99 },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ capabilities: newPokemon.capabilities });
            });

            it('should include capabilities in diff when other capabilities content differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ capabilities: { numOfOtherCapabilities: 1 } });
                const { capabilities: { other } } = createPtuPokemonCollectionData({ capabilities: { numOfOtherCapabilities: 3 } });
                const newPokemon = {
                    ...originalPokemon,
                    capabilities: { ...originalPokemon.capabilities, other },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ capabilities: newPokemon.capabilities });
            });
        });

        describe('field: skills', () =>
        {
            it.each([
                'athletics',
                'acrobatics',
                'combat',
                'stealth',
                'perception',
                'focus',
            ])('should include skills in diff when %s differs', (skill) =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = {
                    ...originalPokemon,
                    skills: { ...originalPokemon.skills, [skill]: '9d6+9' },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ skills: newPokemon.skills });
            });
        });

        describe('field: moveList', () =>
        {
            const baseMoveList: PtuPokemonCollection['moveList'] = {
                levelUp: [{
                    move: 'Tackle', level: 1, type: 'Normal',
                }],
                tmHm: [],
                eggMoves: [],
                tutorMoves: [],
                zygardeCubeMoves: [],
            };

            it('should include moveList in diff when levelUp moves differ', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ moveList: baseMoveList });
                const newPokemon = {
                    ...originalPokemon,
                    moveList: {
                        ...baseMoveList,
                        levelUp: [{
                            move: 'Ember', level: 1, type: 'Fire',
                        }],
                    },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ moveList: newPokemon.moveList });
            });

            it.each([
                'tmHm',
                'eggMoves',
                'tutorMoves',
                'zygardeCubeMoves',
            ])('should include moveList in diff when %s differs', (moveList) =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ moveList: baseMoveList });
                const newPokemon = { ...originalPokemon, moveList: { ...baseMoveList, [moveList]: ['New Move'] } };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ moveList: newPokemon.moveList });
            });
        });

        describe('field: megaEvolutions', () =>
        {
            const baseMegaEvolution: NonNullable<PtuPokemonCollection['megaEvolutions']>[number] = {
                name: 'Mega Charizard X',
                types: [PokemonType.Fire, PokemonType.Dragon],
                ability: 'Tough Claws',
                stats: { attack: '+4', defense: '+3' },
            };

            it('should include megaEvolutions in diff when an original mega is absent from new', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ megaEvolutions: [baseMegaEvolution] });
                const newPokemon = { ...originalPokemon, megaEvolutions: [] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ megaEvolutions: [] });
            });

            it('should include megaEvolutions in diff when an original mega has different stats in new', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ megaEvolutions: [baseMegaEvolution] });
                const newPokemon = { ...originalPokemon, megaEvolutions: [{ ...baseMegaEvolution, stats: { attack: '+2' } }] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ megaEvolutions: newPokemon.megaEvolutions });
            });

            it('should include megaEvolutions in diff when new adds a mega that original did not have', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({ megaEvolutions: [] });
                const newPokemon = { ...originalPokemon, megaEvolutions: [baseMegaEvolution] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ megaEvolutions: newPokemon.megaEvolutions });
            });
        });

        describe('field: metadata', () =>
        {
            it.each([
                { field: 'dexNumber', value: '#999' },
                { field: 'source', value: 'New Source' },
                { field: 'page', value: 'p.999' },
            ] as const)('should include metadata in diff when $field differs', ({ field, value }) =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = {
                    ...originalPokemon,
                    metadata: { ...originalPokemon.metadata, [field]: value },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ metadata: newPokemon.metadata });
            });

            // imageUrl is intentionally excluded from the diff comparison.
            it('should not include metadata in diff when only imageUrl differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData();
                const newPokemon = {
                    ...originalPokemon,
                    metadata: { ...originalPokemon.metadata, imageUrl: 'https://new-image.com/image.png' },
                };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result.metadata).toBeUndefined();
            });
        });

        describe('field: extras', () =>
        {
            it('should include extras in diff when both name and value differ', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({
                    extras: [{ name: 'Original Name', value: 'Original Value' }],
                });
                const newPokemon = { ...originalPokemon, extras: [{ name: 'New Name', value: 'New Value' }] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ extras: newPokemon.extras });
            });

            it('should include extras in diff when only name differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({
                    extras: [{ name: 'Original Name', value: 'Shared Value' }],
                });
                const newPokemon = { ...originalPokemon, extras: [{ name: 'New Name', value: 'Shared Value' }] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ extras: newPokemon.extras });
            });

            it('should include extras in diff when only value differs', () =>
            {
                // Arrange
                const originalPokemon = createPtuPokemonCollectionData({
                    extras: [{ name: 'Shared Name', value: 'Original Value' }],
                });
                const newPokemon = { ...originalPokemon, extras: [{ name: 'Shared Name', value: 'New Value' }] };

                // Act
                const result = PokemonDiffService.getDifference({ originalPokemon, newPokemon });

                // Assert
                expect(result).toEqual({ extras: newPokemon.extras });
            });
        });
    });

    describe(`method: ${PokemonDiffService.isEqual.name}`, () =>
    {
        it('should return true when both pokemon are identical', () =>
        {
            // Arrange
            const pokemon = createPtuPokemonCollectionData();

            // Act
            const result = PokemonDiffService.isEqual({ originalPokemon: pokemon, newPokemon: pokemon });

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when pokemon differ', () =>
        {
            // Arrange
            const originalPokemon = createPtuPokemonCollectionData();
            const newPokemon = { ...originalPokemon, name: 'Different' };

            // Act
            const result = PokemonDiffService.isEqual({ originalPokemon, newPokemon });

            // Assert
            expect(result).toBe(false);
        });
    });
});
