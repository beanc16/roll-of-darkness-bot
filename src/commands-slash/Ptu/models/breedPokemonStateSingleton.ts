import type { User } from 'discord.js';

import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import {
    GetGenderResult,
    RollShinyResult,
    RollSpeciesResult,
} from '../types/breed.js';
import { PtuNature } from '../types/PtuNature.js';

export enum BreedPokemonShouldPickKey
{
    Gender = 'Gender',
    Nature = 'Nature',
    Ability = 'Ability',
    Shiny = 'Shiny',
    InheritanceMoves = 'Inheritance Moves',
}

export interface BreedPokemonState
{
    speciesResult: RollSpeciesResult;
    nature: PtuNature | undefined;
    ability?: string;
    shouldPickAbilityManually: boolean;
    genderResult: GetGenderResult;
    shinyResult: RollShinyResult;
    inheritanceMoves?: string;
    user: User;
    gm: User;
    userShouldPick: {
        [BreedPokemonShouldPickKey.Gender]: boolean;
        [BreedPokemonShouldPickKey.Nature]: boolean;
        [BreedPokemonShouldPickKey.Ability]: boolean;
        [BreedPokemonShouldPickKey.InheritanceMoves]: boolean;
    };
    gmShouldPick: {
        [BreedPokemonShouldPickKey.Gender]: boolean;
        [BreedPokemonShouldPickKey.Ability]: boolean;
        [BreedPokemonShouldPickKey.InheritanceMoves]: boolean;
    };
}

class BreedPokemonStateSingleton extends RecordSingleton<string, BreedPokemonState>
{
}

export default new BreedPokemonStateSingleton();
