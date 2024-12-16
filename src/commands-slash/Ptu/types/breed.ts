import { ButtonInteraction } from 'discord.js';

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
    buttonInteraction?: ButtonInteraction;
} | {
    roll: number;
    buttonInteraction?: ButtonInteraction;
};

export interface RollShinyResult
{
    isShiny: boolean;
    roll: number;
}
