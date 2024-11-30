import { PokemonTypeAndNone } from '../types/pokemon.js';

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
                return { ...this.offensiveToDefensiveTypeEffectivenessMap[type] };
            },
            [TypeEffectivenessRole.Defensive]: (type: PokemonTypeAndNone) =>
            {
                return { ...this.defensiveToOffensiveTypeEffectivenessMap[type] };
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
}
