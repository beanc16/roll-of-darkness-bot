import { PokemonTypeAndNone } from '../types/pokemon.js';
import {
    PtuAbilityForDefensiveTypeEffectiveness,
    PtuAbilityForOffensiveTypeEffectiveness,
    PtuAbilityForTypeEffectiveness,
} from '../types/PtuAbilityForTypeEffectiveness.js';

export enum TypeEffectivenessRole
{
    Offensive = 'offensive',
    Defensive = 'defensive',
}

export type PokemonTypeToTypeEffectiveness = Record<PokemonTypeAndNone, number>;

export type TypeEffectivenessMap = Record<PokemonTypeAndNone, PokemonTypeToTypeEffectiveness>;

export type PokemonTypePossibility = PokemonTypeAndNone | Exclude<PokemonTypeAndNone, PokemonTypeAndNone.None>;

export type GetTypeEffectivenessForTypesResponse = Record<PokemonTypePossibility, number>;

export class PokemonTypeEffectivenessService
{
    private static offensiveToDefensiveTypeEffectivenessMap: TypeEffectivenessMap = {
        [PokemonTypeAndNone.Normal]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 0.5,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 0,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Fighting]: {
            [PokemonTypeAndNone.Normal]: 2,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 0.5,
            [PokemonTypeAndNone.Poison]: 0.5,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 2,
            [PokemonTypeAndNone.Bug]: 0.5,
            [PokemonTypeAndNone.Ghost]: 0,
            [PokemonTypeAndNone.Steel]: 2,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 0.5,
            [PokemonTypeAndNone.Ice]: 2,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 2,
            [PokemonTypeAndNone.Fairy]: 0.5,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Flying]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 2,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 0.5,
            [PokemonTypeAndNone.Bug]: 2,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 2,
            [PokemonTypeAndNone.Electric]: 0.5,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Poison]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 0.5,
            [PokemonTypeAndNone.Ground]: 0.5,
            [PokemonTypeAndNone.Rock]: 0.5,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 0.5,
            [PokemonTypeAndNone.Steel]: 0,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 2,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 2,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Ground]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 0,
            [PokemonTypeAndNone.Poison]: 2,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 2,
            [PokemonTypeAndNone.Bug]: 0.5,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 2,
            [PokemonTypeAndNone.Fire]: 2,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 0.5,
            [PokemonTypeAndNone.Electric]: 2,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Rock]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 0.5,
            [PokemonTypeAndNone.Flying]: 2,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 0.5,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 2,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 2,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 2,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Bug]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 0.5,
            [PokemonTypeAndNone.Flying]: 0.5,
            [PokemonTypeAndNone.Poison]: 0.5,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 0.5,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 0.5,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 2,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 2,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 2,
            [PokemonTypeAndNone.Fairy]: 0.5,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Ghost]: {
            [PokemonTypeAndNone.Normal]: 0,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 2,
            [PokemonTypeAndNone.Steel]: 1,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 2,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Steel]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 2,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 0.5,
            [PokemonTypeAndNone.Water]: 0.5,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 0.5,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 2,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 2,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Fire]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 0.5,
            [PokemonTypeAndNone.Bug]: 2,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 2,
            [PokemonTypeAndNone.Fire]: 0.5,
            [PokemonTypeAndNone.Water]: 0.5,
            [PokemonTypeAndNone.Grass]: 2,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 2,
            [PokemonTypeAndNone.Dragon]: 0.5,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Water]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 2,
            [PokemonTypeAndNone.Rock]: 2,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 1,
            [PokemonTypeAndNone.Fire]: 2,
            [PokemonTypeAndNone.Water]: 0.5,
            [PokemonTypeAndNone.Grass]: 0.5,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 0.5,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Grass]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 0.5,
            [PokemonTypeAndNone.Poison]: 0.5,
            [PokemonTypeAndNone.Ground]: 2,
            [PokemonTypeAndNone.Rock]: 2,
            [PokemonTypeAndNone.Bug]: 0.5,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 0.5,
            [PokemonTypeAndNone.Water]: 2,
            [PokemonTypeAndNone.Grass]: 0.5,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 0.5,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Electric]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 2,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 0,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 1,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 2,
            [PokemonTypeAndNone.Grass]: 0.5,
            [PokemonTypeAndNone.Electric]: 0.5,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 0.5,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Psychic]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 2,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 2,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 0.5,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 0,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Ice]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 2,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 2,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 0.5,
            [PokemonTypeAndNone.Water]: 0.5,
            [PokemonTypeAndNone.Grass]: 2,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 0.5,
            [PokemonTypeAndNone.Dragon]: 2,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Dragon]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 2,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 0,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Dark]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 0.5,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 2,
            [PokemonTypeAndNone.Steel]: 1,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 2,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 0.5,
            [PokemonTypeAndNone.Fairy]: 0.5,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.Fairy]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 2,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 0.5,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 0.5,
            [PokemonTypeAndNone.Fire]: 0.5,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 2,
            [PokemonTypeAndNone.Dark]: 2,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
        [PokemonTypeAndNone.None]: {
            [PokemonTypeAndNone.Normal]: 1,
            [PokemonTypeAndNone.Fighting]: 1,
            [PokemonTypeAndNone.Flying]: 1,
            [PokemonTypeAndNone.Poison]: 1,
            [PokemonTypeAndNone.Ground]: 1,
            [PokemonTypeAndNone.Rock]: 1,
            [PokemonTypeAndNone.Bug]: 1,
            [PokemonTypeAndNone.Ghost]: 1,
            [PokemonTypeAndNone.Steel]: 1,
            [PokemonTypeAndNone.Fire]: 1,
            [PokemonTypeAndNone.Water]: 1,
            [PokemonTypeAndNone.Grass]: 1,
            [PokemonTypeAndNone.Electric]: 1,
            [PokemonTypeAndNone.Psychic]: 1,
            [PokemonTypeAndNone.Ice]: 1,
            [PokemonTypeAndNone.Dragon]: 1,
            [PokemonTypeAndNone.Dark]: 1,
            [PokemonTypeAndNone.Fairy]: 1,
            [PokemonTypeAndNone.None]: 1,
        },
    };

    private static defensiveToOffensiveTypeEffectivenessMap = Object.entries(
        this.offensiveToDefensiveTypeEffectivenessMap,
    ).reduce<TypeEffectivenessMap>((acc, cur) =>
    {
        const [offensiveKey, defensiveKeyToTypeEffectiveness] = cur as [
            PokemonTypeAndNone,
            Record<PokemonTypeAndNone, number>,
        ];

        Object.entries(defensiveKeyToTypeEffectiveness).forEach((cur2) =>
        {
            const [defensiveKey, typeEffectiveness] = cur2 as [
                PokemonTypeAndNone,
                number,
            ];

            if (!acc[defensiveKey])
            {
                acc[defensiveKey] = {} as PokemonTypeToTypeEffectiveness;
            }

            acc[defensiveKey][offensiveKey] = typeEffectiveness;
        });

        return acc;
    }, {} as TypeEffectivenessMap);

    public static getTypeEffectivenessByRole(
        role: TypeEffectivenessRole,
        [type1, type2]: [PokemonTypeAndNone, PokemonTypeAndNone],
    ): number
    {
        const typeEffectivenessRoleToTypeEffectiveness: Record<TypeEffectivenessRole, number> = {
            [TypeEffectivenessRole.Offensive]: this.offensiveToDefensiveTypeEffectivenessMap[type1][type2],
            [TypeEffectivenessRole.Defensive]: this.defensiveToOffensiveTypeEffectivenessMap[type1][type2],
        };

        return typeEffectivenessRoleToTypeEffectiveness[role];
    }

    public static getTypeEffectivenessForTypes(
        role: TypeEffectivenessRole,
        types: PokemonTypeAndNone[],
        abilities: PtuAbilityForTypeEffectiveness[],
    ): GetTypeEffectivenessForTypesResponse
    {
        // Set up boolean. We only include None in the output if it's included in the input.
        const hasNoneInInput = new Set(types).has(PokemonTypeAndNone.None);

        // Set up maps to assist the final .reduce
        const typeEffectivenessRoleToTypeEffectivenessMap: Record<TypeEffectivenessRole, (
            type: PokemonTypeAndNone
        ) => PokemonTypeToTypeEffectiveness> = {
            [TypeEffectivenessRole.Offensive]: (type: PokemonTypeAndNone) =>
            {
                const result = this.modifyTypeEffectivenessWithAbilities({
                    map: this.offensiveToDefensiveTypeEffectivenessMap[type],
                    type,
                    role,
                    abilities,
                });

                return result;
            },
            [TypeEffectivenessRole.Defensive]: (type: PokemonTypeAndNone) =>
            {
                const result = this.modifyTypeEffectivenessWithAbilities({
                    map: this.defensiveToOffensiveTypeEffectivenessMap[type],
                    type,
                    role,
                    abilities,
                });

                return result;
            },
        };

        const {
            [PokemonTypeAndNone.None]: _,
            ...typeEffectivenessMapWithoutNone
        } = this.offensiveToDefensiveTypeEffectivenessMap[PokemonTypeAndNone.None];

        const typeEffectivenessRoleToStartingAcc: Record<TypeEffectivenessRole, PokemonTypeToTypeEffectiveness> = {
            // Using hacky typecasts so that these can be initialized later
            [TypeEffectivenessRole.Offensive]: {} as unknown as PokemonTypeToTypeEffectiveness,
            [TypeEffectivenessRole.Defensive]: hasNoneInInput
                ? { ...this.offensiveToDefensiveTypeEffectivenessMap[PokemonTypeAndNone.None] }
                : {
                    ...typeEffectivenessMapWithoutNone,
                } as PokemonTypeToTypeEffectiveness,
        };

        // Get type effectiveness from each type
        return types.reduce<PokemonTypeToTypeEffectiveness>((acc, firstType) =>
        {
            const typeEffectivenessMap = typeEffectivenessRoleToTypeEffectivenessMap[role](firstType);

            // Multiply the type effectiveness for the given types for all types
            Object.entries(typeEffectivenessMap).forEach((cur) =>
            {
                const [secondType, typeEffectiveness] = cur as [PokemonTypeAndNone, number];

                // Exclude None if it's not in the input
                if (!hasNoneInInput && secondType === PokemonTypeAndNone.None)
                {
                    return;
                }

                // Do a multiplier for defense
                if (role === TypeEffectivenessRole.Defensive)
                {
                    acc[secondType] *= typeEffectiveness;
                }

                // Take the highest value for offense
                else if (role === TypeEffectivenessRole.Offensive)
                {
                    acc[secondType] = Math.max(acc[secondType] ?? 0, typeEffectiveness);
                }
            });

            return acc;
        }, typeEffectivenessRoleToStartingAcc[role]);
    }

    private static tryIncreaseOneStep(value: number): number
    {
        if (value > 0.5)
        {
            return value;
        }

        return value * 2;
    }

    private static resistOneStep(value: number): number
    {
        if (value === 2)
        {
            return value - 0.5;
        }

        if (value > 2)
        {
            return value - 1;
        }

        return value / 2;
    }

    private static tryResistHalfStep(value: number): number
    {
        if (value === 1.5)
        {
            return 1.25;
        }

        if (value === 2)
        {
            return 1.5;
        }

        if (value > 2)
        {
            return value - 1;
        }

        return value;
    }

    private static modifyTypeEffectivenessWithAbilities({
        map,
        type,
        role,
        abilities,
    }: {
        map: PokemonTypeToTypeEffectiveness;
        type: PokemonTypeAndNone;
        role: TypeEffectivenessRole;
        abilities: PtuAbilityForTypeEffectiveness[];
    }): PokemonTypeToTypeEffectiveness
    {
        const offensiveHandlerMap: Record<
            PtuAbilityForOffensiveTypeEffectiveness,
            (acc: PokemonTypeToTypeEffectiveness) => PokemonTypeToTypeEffectiveness
        > = {
            [PtuAbilityForOffensiveTypeEffectiveness.Scrappy]: (acc) =>
            {
                if (type === PokemonTypeAndNone.Normal || type === PokemonTypeAndNone.Fighting)
                {
                    acc.Ghost = 1;
                }

                return acc;
            },
            [PtuAbilityForOffensiveTypeEffectiveness.TintedLens]: (acc) =>
            {
                const result = Object.entries(acc).reduce<PokemonTypeToTypeEffectiveness>((acc2, cur) =>
                {
                    const [key, value] = cur as [PokemonTypeAndNone, number];
                    acc2[key] = this.tryIncreaseOneStep(value);
                    return acc2;
                }, {} as PokemonTypeToTypeEffectiveness);

                return result;
            },
        };

        const defensiveHandlerMap: Record<
            PtuAbilityForDefensiveTypeEffectiveness,
            (acc: PokemonTypeToTypeEffectiveness) => PokemonTypeToTypeEffectiveness
        > = {
            [PtuAbilityForDefensiveTypeEffectiveness.CaveCrasher]: (acc) =>
            {
                acc.Ground = this.resistOneStep(acc.Ground);
                acc.Rock = this.resistOneStep(acc.Ground);
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.MudDweller]: (acc) =>
            {
                acc.Ground = this.resistOneStep(acc.Ground);
                acc.Water = this.resistOneStep(acc.Water);
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.DrySkin]: (acc) =>
            {
                acc.Water = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.WaterAbsorb]: (acc) =>
            {
                acc.Water = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.StormDrain]: (acc) =>
            {
                acc.Water = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.StormDrainErrata]: (acc) =>
            {
                acc.Water = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.SapSipper]: (acc) =>
            {
                acc.Grass = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.SapSipperErrata]: (acc) =>
            {
                acc.Grass = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.FlashFire]: (acc) =>
            {
                acc.Fire = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.FlashFireErrata]: (acc) =>
            {
                acc.Fire = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.SunBlanket]: (acc) =>
            {
                acc.Fire = this.resistOneStep(acc.Fire);
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.FlyingFlyTrap]: (acc) =>
            {
                acc.Bug = 0;
                acc.Ground = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.ThickFat]: (acc) =>
            {
                acc.Fire = this.resistOneStep(acc.Fire);
                acc.Ice = this.resistOneStep(acc.Ice);
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.Filter]: (acc) =>
            {
                // Resist everything that's 1.5 or higher by a half step.
                const result = Object.entries(acc).reduce<PokemonTypeToTypeEffectiveness>((acc2, cur) =>
                {
                    const [key, value] = cur as [PokemonTypeAndNone, number];
                    acc2[key] = this.tryResistHalfStep(value);
                    return acc2;
                }, {} as PokemonTypeToTypeEffectiveness);

                return result;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.SolidRock]: (acc) =>
            {
                // Resist everything that's 1.5 or higher by a half step.
                const result = Object.entries(acc).reduce<PokemonTypeToTypeEffectiveness>((acc2, cur) =>
                {
                    const [key, value] = cur as [PokemonTypeAndNone, number];
                    acc2[key] = this.tryResistHalfStep(value);
                    return acc2;
                }, {} as PokemonTypeToTypeEffectiveness);

                return result;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.Tolerance]: (acc) =>
            {
                // Resist everything that's already resisted by another step.
                const result = Object.entries(acc).reduce<PokemonTypeToTypeEffectiveness>((acc2, cur) =>
                {
                    const [key, value] = cur as [PokemonTypeAndNone, number];

                    if (value < 1)
                    {
                        acc2[key] = this.resistOneStep(value);
                    }

                    return acc2;
                }, {} as PokemonTypeToTypeEffectiveness);

                return result;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.Heatproof]: (acc) =>
            {
                acc.Fire = this.resistOneStep(acc.Fire);
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.HeatproofErrata]: (acc) =>
            {
                acc.Fire = this.resistOneStep(acc.Fire);
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.Levitate]: (acc) =>
            {
                acc.Ground = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.MotorDrive]: (acc) =>
            {
                acc.Electric = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.VoltAbsorb]: (acc) =>
            {
                acc.Electric = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.LightningRod]: (acc) =>
            {
                acc.Electric = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.LightningRodErrata]: (acc) =>
            {
                acc.Electric = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.Tochukaso]: (acc) =>
            {
                acc.Bug = this.resistOneStep(acc.Bug);
                acc.Poison = this.resistOneStep(acc.Poison);
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.Windveiled]: (acc) =>
            {
                acc.Flying = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.WindveiledErrata]: (acc) =>
            {
                acc.Flying = 0;
                return acc;
            },
            [PtuAbilityForDefensiveTypeEffectiveness.WintersKiss]: (acc) =>
            {
                acc.Ice = 0;
                return acc;
            },
        };

        return abilities.reduce<PokemonTypeToTypeEffectiveness>((acc, ability) =>
        {
            if (role === TypeEffectivenessRole.Offensive)
            {
                const typedAbility = ability as PtuAbilityForOffensiveTypeEffectiveness;
                return offensiveHandlerMap[typedAbility]?.(acc) || acc;
            }

            if (role === TypeEffectivenessRole.Defensive)
            {
                const typedAbility = ability as PtuAbilityForDefensiveTypeEffectiveness;
                return defensiveHandlerMap[typedAbility]?.(acc) || acc;
            }

            return acc;
        }, { ...map });
    }
}
