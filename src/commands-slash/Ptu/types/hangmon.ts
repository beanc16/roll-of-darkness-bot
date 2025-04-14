import type { PtuPokemon } from './pokemon.js';

export enum HangmonPropertyHint
{
    Name = 'Name',
    OneType = 'One Type',
    DexName = 'Pokédex Name',
    PtuSize = 'PTU Size',
    PtuWeightClass = 'PTU Weight Class',
    OneHabitat = 'One Habitat',
    OneDiet = 'One Diet',
    OneEggGroup = 'One Egg Group',
}

export enum HangmonVictoryState
{
    Win = 'Win',
    Loss = 'Loss',
    InProgress = 'In Progress',
}

export interface HangmonState
{
    numOfGuesses: number;
    victoryState: HangmonVictoryState;
    remainingPokemonOptions: PtuPokemon[];
    correct: {
        pokemon: PtuPokemon;
        hints: Partial<Record<HangmonPropertyHint, string>>;
    };
    incorrect: {
        pokemon: PtuPokemon[];
        hints: Record<HangmonPropertyHint, string[]>;
    };
}
