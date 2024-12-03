import {
    PokemonTypeEffectivenessService,
    type PokemonTypeToTypeEffectiveness,
    TypeEffectivenessRole,
} from '../../../../src/commands-slash/Ptu/services/PokemonTypeEffectivenessService.js';
import { PokemonTypeAndNone } from '../../../../src/commands-slash/Ptu/types/pokemon.js';
import { PtuAbilityForDefensiveTypeEffectiveness, PtuAbilityForOffensiveTypeEffectiveness } from '../../../../src/commands-slash/Ptu/types/PtuAbilityForTypeEffectiveness.js';

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
        )('role: %s', (role) =>
        {
            it('should return neutral effectiveness for None type', () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.None],
                    [],
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
                    [],
                );

                expect(Object.keys(result)).toContain(PokemonTypeAndNone.None);
            });

            it(`should include ${PokemonTypeAndNone.None} if included as the second input type`, () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.Normal, PokemonTypeAndNone.None],
                    [],
                );

                expect(Object.keys(result)).toContain(PokemonTypeAndNone.None);
            });

            it(`should not include ${PokemonTypeAndNone.None} if not included as the first input type`, () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.Normal],
                    [],
                );

                expect(Object.keys(result)).not.toContain(PokemonTypeAndNone.None);
            });

            it(`should not include ${PokemonTypeAndNone.None} if not included as the second input type`, () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    role,
                    [PokemonTypeAndNone.Normal, PokemonTypeAndNone.Fighting],
                    [],
                );

                expect(Object.keys(result)).not.toContain(PokemonTypeAndNone.None);
            });
        });

        describe(`role: ${TypeEffectivenessRole.Offensive}`, () =>
        {
            it('should calculate type effectiveness for multiple types', () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    TypeEffectivenessRole.Offensive,
                    [PokemonTypeAndNone.Fire, PokemonTypeAndNone.Water],
                    [],
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

        describe(`role: ${TypeEffectivenessRole.Defensive}`, () =>
        {
            it('should calculate type effectiveness for multiple types', () =>
            {
                const result = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
                    TypeEffectivenessRole.Defensive,
                    [PokemonTypeAndNone.Fire, PokemonTypeAndNone.Water],
                    [],
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

    describe('modifyTypeEffectivenessWithAbilities', () =>
    {
        let validMap: PokemonTypeToTypeEffectiveness;

        beforeEach(() =>
        {
            validMap = Object.values(PokemonTypeAndNone).reduce<PokemonTypeToTypeEffectiveness>((acc, cur) =>
            {
                acc[cur] = 1;
                return acc;
            }, {} as PokemonTypeToTypeEffectiveness);
        });

        describe(`role: ${TypeEffectivenessRole.Offensive}`, () =>
        {
            const role = TypeEffectivenessRole.Offensive;

            it.each([
                [PokemonTypeAndNone.Normal, PtuAbilityForOffensiveTypeEffectiveness.Scrappy],
                [PokemonTypeAndNone.Fighting, PtuAbilityForOffensiveTypeEffectiveness.Scrappy],
            ])(`%s type should have neutral type effectiveness on ${PokemonTypeAndNone.Ghost} type with the %s ability`, (type) =>
            {
                const result = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map: {
                        ...validMap,
                        [PokemonTypeAndNone.Ghost]: 0,
                    },
                    type,
                    role,
                    abilities: [PtuAbilityForOffensiveTypeEffectiveness.Scrappy],
                });

                expect(result.Ghost).toEqual(1);
            });

            it(`should increase resisted types to neutral, doubly resisted types to resisted, and triply resisted types to doubly resisted with the ${PtuAbilityForOffensiveTypeEffectiveness.TintedLens} ability`, () =>
            {
                const map = Object.values(PokemonTypeAndNone).reduce<PokemonTypeToTypeEffectiveness>((acc, cur, index) =>
                {
                    if (index % 5 === 0)
                    {
                        acc[cur] = 2;
                    }
                    else if (index % 5 === 1)
                    {
                        acc[cur] = 1;
                    }
                    else if (index % 5 === 2)
                    {
                        acc[cur] = 0.5;
                    }
                    else if (index % 5 === 3)
                    {
                        acc[cur] = 0.25;
                    }
                    else
                    {
                        acc[cur] = 0.125;
                    }

                    return acc;
                }, {} as PokemonTypeToTypeEffectiveness);

                const result = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map,
                    type: PokemonTypeAndNone.None, // This is an arbitrary value, the map matters more in this test then the type
                    role,
                    abilities: [PtuAbilityForOffensiveTypeEffectiveness.TintedLens],
                });

                const expectedResult = Object.keys(map).reduce<PokemonTypeToTypeEffectiveness>((acc, cur, index) =>
                {
                    const curType = cur as PokemonTypeAndNone;

                    if (index % 5 === 0)
                    {
                        acc[curType] = 2;
                    }
                    else if (index % 5 === 1)
                    {
                        acc[curType] = 1;
                    }
                    else if (index % 5 === 2)
                    {
                        acc[curType] = 1;
                    }
                    else if (index % 5 === 3)
                    {
                        acc[curType] = 0.5;
                    }
                    else if (index % 5 === 4)
                    {
                        acc[curType] = 0.25;
                    }
                    else
                    {
                        acc[curType] = 0.125;
                    }

                    return acc;
                }, {} as PokemonTypeToTypeEffectiveness);

                expect(result).toEqual(expectedResult);
            });
        });

        describe(`role: ${TypeEffectivenessRole.Defensive}`, () =>
        {
            const type = PokemonTypeAndNone.None;
            const role = TypeEffectivenessRole.Defensive;

            it.each([
                // Cave Crasher
                [PokemonTypeAndNone.Rock, PtuAbilityForDefensiveTypeEffectiveness.CaveCrasher],
                [PokemonTypeAndNone.Ground, PtuAbilityForDefensiveTypeEffectiveness.CaveCrasher],

                // Mud Dweller
                [PokemonTypeAndNone.Ground, PtuAbilityForDefensiveTypeEffectiveness.MudDweller],
                [PokemonTypeAndNone.Water, PtuAbilityForDefensiveTypeEffectiveness.MudDweller],

                // Sun Blanket
                [PokemonTypeAndNone.Fire, PtuAbilityForDefensiveTypeEffectiveness.SunBlanket],

                // Thick Fat
                [PokemonTypeAndNone.Fire, PtuAbilityForDefensiveTypeEffectiveness.ThickFat],
                [PokemonTypeAndNone.Ice, PtuAbilityForDefensiveTypeEffectiveness.ThickFat],

                // Heatproof
                [PokemonTypeAndNone.Fire, PtuAbilityForDefensiveTypeEffectiveness.Heatproof],
                [PokemonTypeAndNone.Fire, PtuAbilityForDefensiveTypeEffectiveness.HeatproofErrata],

                // Tochukaso
                [PokemonTypeAndNone.Bug, PtuAbilityForDefensiveTypeEffectiveness.Tochukaso],
                [PokemonTypeAndNone.Poison, PtuAbilityForDefensiveTypeEffectiveness.Tochukaso],
            ])(`%s type should be resisted by one step with the %s ability`, (resistedType, ability) =>
            {
                const neutralMap = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map: { ...validMap },
                    type,
                    role,
                    abilities: [ability],
                });
                const neutralExpectedResult = {
                    ...validMap,
                    [resistedType]: 0.5,
                };

                const doublySuperEffectiveMap = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map: {
                        ...validMap,
                        [resistedType]: 2,
                    },
                    type,
                    role,
                    abilities: [ability],
                });
                const doublySuperEffectiveExpectedResult = {
                    ...validMap,
                    [resistedType]: 1.5,
                };

                const triplySuperEffectiveMap = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map: {
                        ...validMap,
                        [resistedType]: 3,
                    },
                    type,
                    role,
                    abilities: [ability],
                });
                const triplySuperEffectiveExpectedResult = {
                    ...validMap,
                    [resistedType]: 2,
                };

                expect(neutralMap[resistedType]).toEqual(
                    neutralExpectedResult[resistedType],
                );
                expect(doublySuperEffectiveMap[resistedType]).toEqual(
                    doublySuperEffectiveExpectedResult[resistedType],
                );
                expect(triplySuperEffectiveMap[resistedType]).toEqual(
                    triplySuperEffectiveExpectedResult[resistedType],
                );
            });

            it.each([
                // Water
                [PokemonTypeAndNone.Water, PtuAbilityForDefensiveTypeEffectiveness.DrySkin],
                [PokemonTypeAndNone.Water, PtuAbilityForDefensiveTypeEffectiveness.WaterAbsorb],
                [PokemonTypeAndNone.Water, PtuAbilityForDefensiveTypeEffectiveness.StormDrain],
                [PokemonTypeAndNone.Water, PtuAbilityForDefensiveTypeEffectiveness.StormDrainErrata],

                // Grass
                [PokemonTypeAndNone.Grass, PtuAbilityForDefensiveTypeEffectiveness.SapSipper],
                [PokemonTypeAndNone.Grass, PtuAbilityForDefensiveTypeEffectiveness.SapSipperErrata],

                // Fire
                [PokemonTypeAndNone.Fire, PtuAbilityForDefensiveTypeEffectiveness.FlashFire],
                [PokemonTypeAndNone.Fire, PtuAbilityForDefensiveTypeEffectiveness.FlashFireErrata],

                // Bug
                [PokemonTypeAndNone.Bug, PtuAbilityForDefensiveTypeEffectiveness.FlyingFlyTrap],

                // Ground
                [PokemonTypeAndNone.Ground, PtuAbilityForDefensiveTypeEffectiveness.FlyingFlyTrap],
                [PokemonTypeAndNone.Ground, PtuAbilityForDefensiveTypeEffectiveness.Levitate],

                // Electric
                [PokemonTypeAndNone.Electric, PtuAbilityForDefensiveTypeEffectiveness.VoltAbsorb],
                [PokemonTypeAndNone.Electric, PtuAbilityForDefensiveTypeEffectiveness.MotorDrive],
                [PokemonTypeAndNone.Electric, PtuAbilityForDefensiveTypeEffectiveness.LightningRod],
                [PokemonTypeAndNone.Electric, PtuAbilityForDefensiveTypeEffectiveness.LightningRodErrata],

                // Flying
                [PokemonTypeAndNone.Flying, PtuAbilityForDefensiveTypeEffectiveness.Windveiled],
                [PokemonTypeAndNone.Flying, PtuAbilityForDefensiveTypeEffectiveness.WindveiledErrata],

                // Ice
                [PokemonTypeAndNone.Ice, PtuAbilityForDefensiveTypeEffectiveness.WintersKiss],
            ])(`should be immune to the %s type with the %s ability`, (resistedType, ability) =>
            {
                const result = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map: {
                        ...validMap,
                        [resistedType]: 0,
                    },
                    type,
                    role,
                    abilities: [ability],
                });

                expect(result[resistedType]).toEqual(0);
            });

            it.each([
                PtuAbilityForDefensiveTypeEffectiveness.Filter,
                PtuAbilityForDefensiveTypeEffectiveness.SolidRock,
            ])(`should resist each type that's super effective by half a step with the %s ability`, (ability) =>
            {
                const map = Object.values(PokemonTypeAndNone).reduce<PokemonTypeToTypeEffectiveness>((acc, cur, index) =>
                {
                    if (index % 4 === 0)
                    {
                        acc[cur] = 1;
                    }
                    else if (index % 4 === 1)
                    {
                        acc[cur] = 1.5;
                    }
                    else if (index % 4 === 2)
                    {
                        acc[cur] = 2;
                    }
                    else
                    {
                        acc[cur] = 3;
                    }

                    return acc;
                }, {} as PokemonTypeToTypeEffectiveness);

                const result = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map,
                    type: PokemonTypeAndNone.None, // This is an arbitrary value, the map matters more in this test then the type
                    role,
                    abilities: [ability],
                });

                const expectedResult = Object.keys(map).reduce<PokemonTypeToTypeEffectiveness>((acc, cur, index) =>
                {
                    const curType = cur as PokemonTypeAndNone;

                    if (index % 4 === 0)
                    {
                        acc[curType] = 1;
                    }
                    else if (index % 4 === 1)
                    {
                        acc[curType] = 1.25;
                    }
                    else if (index % 4 === 2)
                    {
                        acc[curType] = 1.5;
                    }
                    else
                    {
                        acc[curType] = 2;
                    }

                    return acc;
                }, {} as PokemonTypeToTypeEffectiveness);

                expect(result).toEqual(expectedResult);
            });

            it(`should resist each type that's already resisted by another step with the ${PtuAbilityForDefensiveTypeEffectiveness.Tolerance} ability`, () =>
            {
                const map = Object.values(PokemonTypeAndNone).reduce<PokemonTypeToTypeEffectiveness>((acc, cur, index) =>
                {
                    if (index % 5 === 0)
                    {
                        acc[cur] = 2;
                    }
                    else if (index % 5 === 1)
                    {
                        acc[cur] = 1.5;
                    }
                    else if (index % 5 === 2)
                    {
                        acc[cur] = 1;
                    }
                    else if (index % 5 === 3)
                    {
                        acc[cur] = 0.5;
                    }
                    else
                    {
                        acc[cur] = 0.25;
                    }

                    return acc;
                }, {} as PokemonTypeToTypeEffectiveness);

                const result = PokemonTypeEffectivenessService['modifyTypeEffectivenessWithAbilities']({
                    map,
                    type: PokemonTypeAndNone.None, // This is an arbitrary value, the map matters more in this test then the type
                    role,
                    abilities: [PtuAbilityForDefensiveTypeEffectiveness.Tolerance],
                });

                const expectedResult = Object.keys(map).reduce<PokemonTypeToTypeEffectiveness>((acc, cur, index) =>
                {
                    const curType = cur as PokemonTypeAndNone;

                    if (index % 5 === 0)
                    {
                        acc[curType] = 2;
                    }
                    else if (index % 5 === 1)
                    {
                        acc[curType] = 1.5;
                    }
                    else if (index % 5 === 2)
                    {
                        acc[curType] = 1;
                    }
                    else if (index % 5 === 3)
                    {
                        acc[curType] = 0.25;
                    }
                    else
                    {
                        acc[curType] = 0.125;
                    }

                    return acc;
                }, {} as PokemonTypeToTypeEffectiveness);

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
