import type { SlashCommandStringOption } from 'discord.js';

import { PtuAutocompleteParameterName } from '../types/autocomplete.js';

export const pokemonMoveNameOption = (option: SlashCommandStringOption, description: string): SlashCommandStringOption =>
{
    option.setName(PtuAutocompleteParameterName.MoveName);
    option.setDescription(description);
    return option.setAutocomplete(true);
};

export const pokemonTypeOption = (option: SlashCommandStringOption, description: string): SlashCommandStringOption =>
{
    option.setName(PtuAutocompleteParameterName.PokemonType);
    option.setDescription(description);
    return option.setAutocomplete(true);
};

export const pokemonMoveCategoryOption = (option: SlashCommandStringOption, description: string): SlashCommandStringOption =>
{
    option.setName(PtuAutocompleteParameterName.MoveCategory);
    option.setDescription(description);
    return option.setAutocomplete(true);
};
