export interface BreedPokemonModalInputData
{
    handleUpdatableButtonInteractions: () => Promise<void>;
}

export enum BreedPokemonCustomIds
{
    Input = 'input',
}

export enum BreedPokemonModalLabel
{
    Ability = `Ability`,
    Gender = `Gender`,
}
