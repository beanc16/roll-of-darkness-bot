import type { SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';

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

export const pokemonMoveDbOption = (option: SlashCommandIntegerOption, description: string, name?: string): SlashCommandIntegerOption =>
{
    option.setName(name ?? 'damage_base');
    option.setDescription(description);
    option.setMinValue(1);
    option.setMaxValue(28);
    return option;
};
