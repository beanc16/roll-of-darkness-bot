export enum PokemonGender
{
    Male = 'Male',
    Female = 'Female',
}

export interface RollSpeciesResult
{
    species: string;
    roll: number;
}

export type GetGenderResult = {
    gender: PokemonGender;
} | {
    roll: number;
};

export interface RollShinyResult
{
    isShiny: boolean;
    roll: number;
}
