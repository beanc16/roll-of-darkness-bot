import {
    PokemonTypeEffectivenessService,
    type PokemonTypeToTypeEffectiveness,
    TypeEffectivenessRole,
} from '../../../../src/commands-slash/Ptu/services/PokemonTypeEffectivenessService.js';
import { PokemonTypeAndNone } from '../../../../src/commands-slash/Ptu/types/pokemon.js';

describe('PokemonTypeEffectivenessService', () =>
{
    describe('getTypeEffectivenessByRole', () =>
    {
        it('should return the correct offensive effectiveness between two types', () =>
        {
            const result = PokemonTypeEffectivenessService.getTypeEffectivenessByRole(
                TypeEffectivenessRole.Offensive,
                [PokemonTypeAndNone.Fire, PokemonTypeAndNone.Grass],
            );

            const expectedResult = 2;
            expect(result).toEqual(expectedResult);
        });

        it('should return the correct defensive effectiveness between two types', () =>
        {
            const result = PokemonTypeEffectivenessService.getTypeEffectivenessByRole(
                TypeEffectivenessRole.Defensive,
                [PokemonTypeAndNone.Water, PokemonTypeAndNone.Fire],
            );

            const expectedResult = 0.5;
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getTypeEffectivenessForTypes', () =>
    {
        describe.each(
            Object.values(TypeEffectivenessRole),
        )('%s', (role) =>
        {
            it('should return neutral effectiveness for None type', () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.None],
                );

                const expectedResult = Object.values(PokemonTypeAndNone).reduce<PokemonTypeToTypeEffectiveness>((acc, type) =>
                {
                    acc[type] = 1;
                    return acc;
                }, {} as PokemonTypeToTypeEffectiveness);

                expect(result).toEqual(expectedResult);
            });

            it(`should include ${PokemonTypeAndNone.None} if included as the first input type`, () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.None],
                );

                expect(Object.keys(result)).toContain(PokemonTypeAndNone.None);
            });

            it(`should include ${PokemonTypeAndNone.None} if included as the second input type`, () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.Normal, PokemonTypeAndNone.None],
                );

                expect(Object.keys(result)).toContain(PokemonTypeAndNone.None);
            });

            it(`should not include ${PokemonTypeAndNone.None} if not included as the first input type`, () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.Normal],
                );

                expect(Object.keys(result)).not.toContain(PokemonTypeAndNone.None);
            });

            it(`should not include ${PokemonTypeAndNone.None} if not included as the second input type`, () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.Normal, PokemonTypeAndNone.Fighting],
                );

                expect(Object.keys(result)).not.toContain(PokemonTypeAndNone.None);
            });
        });

        describe(`${TypeEffectivenessRole.Offensive}`, () =>
        {
            it('should calculate type effectiveness for multiple types', () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    TypeEffectivenessRole.Offensive,
                    [PokemonTypeAndNone.Fire, PokemonTypeAndNone.Water],
                );

                expect(result).toEqual({
                    [PokemonTypeAndNone.Normal]: 1,
                    [PokemonTypeAndNone.Fighting]: 1,
                    [PokemonTypeAndNone.Flying]: 1,
                    [PokemonTypeAndNone.Poison]: 1,
                    [PokemonTypeAndNone.Ground]: 2,
                    [PokemonTypeAndNone.Rock]: 2,
                    [PokemonTypeAndNone.Bug]: 2,
                    [PokemonTypeAndNone.Ghost]: 1,
                    [PokemonTypeAndNone.Steel]: 2,
                    [PokemonTypeAndNone.Fire]: 2,
                    [PokemonTypeAndNone.Water]: 0.5,
                    [PokemonTypeAndNone.Grass]: 2,
                    [PokemonTypeAndNone.Electric]: 1,
                    [PokemonTypeAndNone.Psychic]: 1,
                    [PokemonTypeAndNone.Ice]: 2,
                    [PokemonTypeAndNone.Dragon]: 0.5,
                    [PokemonTypeAndNone.Dark]: 1,
                    [PokemonTypeAndNone.Fairy]: 1,
                });
            });
        });

        describe(`${TypeEffectivenessRole.Defensive}`, () =>
        {
            it('should calculate type effectiveness for multiple types', () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    TypeEffectivenessRole.Defensive,
                    [PokemonTypeAndNone.Fire, PokemonTypeAndNone.Water],
                );

                expect(result).toEqual({
                    [PokemonTypeAndNone.Normal]: 1,
                    [PokemonTypeAndNone.Fighting]: 1,
                    [PokemonTypeAndNone.Flying]: 1,
                    [PokemonTypeAndNone.Poison]: 1,
                    [PokemonTypeAndNone.Ground]: 2,
                    [PokemonTypeAndNone.Rock]: 2,
                    [PokemonTypeAndNone.Bug]: 0.5,
                    [PokemonTypeAndNone.Ghost]: 1,
                    [PokemonTypeAndNone.Steel]: 0.25,
                    [PokemonTypeAndNone.Fire]: 0.25,
                    [PokemonTypeAndNone.Water]: 1,
                    [PokemonTypeAndNone.Grass]: 1,
                    [PokemonTypeAndNone.Electric]: 2,
                    [PokemonTypeAndNone.Psychic]: 1,
                    [PokemonTypeAndNone.Ice]: 0.25,
                    [PokemonTypeAndNone.Dragon]: 1,
                    [PokemonTypeAndNone.Dark]: 1,
                    [PokemonTypeAndNone.Fairy]: 0.5,
                });
            });
        });
    });
});
