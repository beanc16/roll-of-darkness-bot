import { PtuPokemon } from '../../types/pokemon.js';

type PtuPokemonToCompare = Omit<PtuPokemon, 'versionName' | 'olderVersions' | 'typeShifts'>;

export class PokemonDiffService
{
    public static getDifference({ originalPokemon, newPokemon }: {
        originalPokemon: PtuPokemonToCompare;
        newPokemon: PtuPokemonToCompare;
    }): Partial<PtuPokemon>
    {
        const output: Partial<PtuPokemon> = {};

        // Types
        if (originalPokemon.name !== newPokemon.name)
        {
            output.name = newPokemon.name;
        }

        // Types
        if (
            originalPokemon.types.length !== newPokemon.types.length
            || !originalPokemon.types.every(type => newPokemon.types.includes(type))
        )
        {
            output.types = newPokemon.types;
        }

        // Base Stats
        if (
            originalPokemon.baseStats.hp !== newPokemon.baseStats.hp
            || originalPokemon.baseStats.attack !== newPokemon.baseStats.attack
            || originalPokemon.baseStats.defense !== newPokemon.baseStats.defense
            || originalPokemon.baseStats.specialAttack !== newPokemon.baseStats.specialAttack
            || originalPokemon.baseStats.specialDefense !== newPokemon.baseStats.specialDefense
            || originalPokemon.baseStats.speed !== newPokemon.baseStats.speed
        )
        {
            output.baseStats = newPokemon.baseStats;
        }

        // Abilities
        if (
            originalPokemon.abilities.basicAbilities.length !== newPokemon.abilities.basicAbilities.length
            || !originalPokemon.abilities.basicAbilities.every(ability => newPokemon.abilities.basicAbilities.includes(ability))
            || originalPokemon.abilities.advancedAbilities.length !== newPokemon.abilities.advancedAbilities.length
            || !originalPokemon.abilities.advancedAbilities.every(ability => newPokemon.abilities.advancedAbilities.includes(ability))
            || originalPokemon.abilities.highAbility !== newPokemon.abilities.highAbility
        )
        {
            output.abilities = newPokemon.abilities;
        }

        // Evolution
        if (
            originalPokemon.evolution.length !== newPokemon.evolution.length
            || !originalPokemon.evolution.every(({
                name,
                level,
                stage,
            }) =>
            {
                if (
                    // Bonsly and Sudowoodo are missing a description in their name that was manually added
                    originalPokemon.name === 'Bonsly'
                    || originalPokemon.name === 'Sudowoodo'
                    // Porygon-Z has a typo in its name and doesn't have a level set that was fixed manually
                    || originalPokemon.name === 'Porygon'
                    || originalPokemon.name === 'Porygon2'
                    || originalPokemon.name === 'Porygon-Z'
                )
                {
                    return true;
                }

                const pokemonEvolution = newPokemon.evolution.find(({ name: pokemonName }) => pokemonName === name);
                return pokemonEvolution?.name === name && pokemonEvolution?.level === level && pokemonEvolution?.stage === stage;
            })
        )
        {
            output.evolution = newPokemon.evolution;
        }

        // Size Information
        if (
            originalPokemon.sizeInformation.height.freedom !== newPokemon.sizeInformation.height.freedom
            || originalPokemon.sizeInformation.height.metric !== newPokemon.sizeInformation.height.metric
            || originalPokemon.sizeInformation.height.ptu !== newPokemon.sizeInformation.height.ptu
            || originalPokemon.sizeInformation.weight.freedom !== newPokemon.sizeInformation.weight.freedom
            || originalPokemon.sizeInformation.weight.metric !== newPokemon.sizeInformation.weight.metric
            || originalPokemon.sizeInformation.weight.ptu !== newPokemon.sizeInformation.weight.ptu
        )
        {
            output.sizeInformation = newPokemon.sizeInformation;
        }

        // Breeding Information
        if (
            originalPokemon.breedingInformation.genderRatio.male !== newPokemon.breedingInformation.genderRatio.male
            || originalPokemon.breedingInformation.genderRatio.female !== newPokemon.breedingInformation.genderRatio.female
            || originalPokemon.breedingInformation.genderRatio.none !== newPokemon.breedingInformation.genderRatio.none
            || originalPokemon.breedingInformation.eggGroups.length !== newPokemon.breedingInformation.eggGroups.length
            || !originalPokemon.breedingInformation.eggGroups.every(group => newPokemon.breedingInformation.eggGroups.includes(group))
            || originalPokemon.breedingInformation.averageHatchRate !== newPokemon.breedingInformation.averageHatchRate
        )
        {
            output.breedingInformation = newPokemon.breedingInformation;
        }

        // Diets
        if (
            originalPokemon.diets.length !== newPokemon.diets.length
            || !originalPokemon.diets.every(diet => newPokemon.diets.includes(diet))
        )
        {
            output.diets = newPokemon.diets;
        }

        // Habitats
        if (originalPokemon.habitats.length !== newPokemon.habitats.length || !originalPokemon.habitats.every(habitat => newPokemon.habitats.includes(habitat)))
        {
            output.habitats = newPokemon.habitats;
        }

        // Capabilities
        if (
            originalPokemon.capabilities.overland !== newPokemon.capabilities.overland
            || originalPokemon.capabilities.swim !== newPokemon.capabilities.swim
            || originalPokemon.capabilities.sky !== newPokemon.capabilities.sky
            || originalPokemon.capabilities.levitate !== newPokemon.capabilities.levitate
            || originalPokemon.capabilities.burrow !== newPokemon.capabilities.burrow
            || originalPokemon.capabilities.highJump !== newPokemon.capabilities.highJump
            || originalPokemon.capabilities.lowJump !== newPokemon.capabilities.lowJump
            || originalPokemon.capabilities.power !== newPokemon.capabilities.power
            || originalPokemon.capabilities.other?.length !== newPokemon.capabilities.other?.length
            || !(originalPokemon.capabilities.other ?? []).every(capability => (newPokemon.capabilities.other ?? []).includes(capability))
        )
        {
            output.capabilities = newPokemon.capabilities;
        }

        // Skills
        if (
            originalPokemon.skills.athletics !== newPokemon.skills.athletics
            || originalPokemon.skills.acrobatics !== newPokemon.skills.acrobatics
            || originalPokemon.skills.combat !== newPokemon.skills.combat
            || originalPokemon.skills.stealth !== newPokemon.skills.stealth
            || originalPokemon.skills.perception !== newPokemon.skills.perception
            || originalPokemon.skills.focus !== newPokemon.skills.focus
        )
        {
            output.skills = newPokemon.skills;
        }

        // Move List
        if (
            originalPokemon.moveList.levelUp.length !== newPokemon.moveList.levelUp.length
            || !originalPokemon.moveList.levelUp.every(move =>
            {
                return newPokemon.moveList.levelUp.some(({
                    level,
                    move: name,
                    type,
                }) =>
                {
                    return move.level === level && move.move === name && move.type === type;
                });
            })
            || originalPokemon.moveList.tmHm.length !== newPokemon.moveList.tmHm.length
            || !originalPokemon.moveList.tmHm.every(move => newPokemon.moveList.tmHm.includes(move))
            || originalPokemon.moveList.eggMoves.length !== newPokemon.moveList.eggMoves.length
            || !originalPokemon.moveList.eggMoves.every(move => newPokemon.moveList.eggMoves.includes(move))
            || originalPokemon.moveList.tutorMoves.length !== newPokemon.moveList.tutorMoves.length
            || !originalPokemon.moveList.tutorMoves.every(move => newPokemon.moveList.tutorMoves.includes(move))
            || originalPokemon.moveList.zygardeCubeMoves?.length !== newPokemon.moveList.zygardeCubeMoves?.length
            || !(originalPokemon.moveList.zygardeCubeMoves ?? []).every(move => (newPokemon.moveList.zygardeCubeMoves ?? []).includes(move))
        )
        {
            output.moveList = newPokemon.moveList;
        }

        // Mega Evolutions
        if (
            originalPokemon.megaEvolutions?.some((megaEvolution) =>
            {
                return !newPokemon.megaEvolutions?.some(({
                    name,
                    types,
                    ability,
                    abilityShift,
                    capabilities,
                    stats,
                }) =>
                {
                    return (
                        megaEvolution.name === name
                        && megaEvolution.types.every((type, index) => type === types[index])
                        && megaEvolution.ability === ability
                        && megaEvolution?.abilityShift === abilityShift
                        && (megaEvolution?.capabilities ?? []).every((capability, index) => capability === capabilities?.[index])
                        && megaEvolution.stats.hp === stats.hp
                        && megaEvolution.stats.attack === stats.attack
                        && megaEvolution.stats.defense === stats.defense
                        && megaEvolution.stats.specialAttack === stats.specialAttack
                        && megaEvolution.stats.specialDefense === stats.specialDefense
                        && megaEvolution.stats.speed === stats.speed
                    );
                });
            })
            || newPokemon.megaEvolutions?.some((megaEvolution) =>
            {
                return !originalPokemon.megaEvolutions?.some(({
                    name,
                    types,
                    ability,
                    abilityShift,
                    capabilities,
                    stats,
                }) =>
                {
                    return (
                        megaEvolution.name === name
                        && megaEvolution.types.every((type, index) => type === types[index])
                        && megaEvolution.ability === ability
                        && megaEvolution?.abilityShift === abilityShift
                        && (megaEvolution?.capabilities ?? []).every((capability, index) => capability === capabilities?.[index])
                        && megaEvolution.stats.hp === stats.hp
                        && megaEvolution.stats.attack === stats.attack
                        && megaEvolution.stats.defense === stats.defense
                        && megaEvolution.stats.specialAttack === stats.specialAttack
                        && megaEvolution.stats.specialDefense === stats.specialDefense
                        && megaEvolution.stats.speed === stats.speed
                    );
                });
            })
        )
        {
            output.megaEvolutions = newPokemon.megaEvolutions;
        }

        // Metadata
        if (
            originalPokemon.metadata.dexNumber !== newPokemon.metadata.dexNumber
            || originalPokemon.metadata.source !== newPokemon.metadata.source
            || originalPokemon.metadata.page !== newPokemon.metadata.page
        )
        {
            output.metadata = newPokemon.metadata;
        }

        // Extras
        if (
            !(originalPokemon.extras ?? []).every((extra, index) =>
                extra.name === newPokemon.extras?.[index]?.name
                && extra.value === newPokemon.extras?.[index]?.value,
            )
        )
        {
            output.extras = newPokemon.extras;
        }

        return output;
    }

    public static isEqual(input: {
        originalPokemon: PtuPokemonToCompare;
        newPokemon: PtuPokemonToCompare;
    }): boolean
    {
        const diff = this.getDifference(input);
        return Object.keys(diff).length === 0;
    }
}
