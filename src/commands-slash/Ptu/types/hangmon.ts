import { PtuPokemonForLookupPokemon } from '../embed-messages/lookup.js';

export enum HangmonPropertyHint
{
    Name = 'Name',
    OneType = 'One Type',
    DexName = 'Pokédex Name',
    PtuSize = 'PTU Size',
    PtuWeightClass = 'PTU Weight Class',
    Habitat = 'Habitat',
    Diet = 'Diet',
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
    remainingPokemonOptions: PtuPokemonForLookupPokemon[];
    correct: {
        pokemon: PtuPokemonForLookupPokemon;
        hints: HangmonPropertyHint[];
    };
    incorrect: {
        pokemon: PtuPokemonForLookupPokemon[];
        hints: Record<HangmonPropertyHint, string[]>;
    };
}
