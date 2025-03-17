import type { APIApplicationCommandOptionChoice, SlashCommandStringOption } from 'discord.js';

import { PtuAutocompleteParameterName } from '../types/autocomplete.js';
import { PokemonMoveCategory, PokemonType } from '../types/pokemon.js';

export const pokemonMoveNameOption = (option: SlashCommandStringOption, description: string): SlashCommandStringOption =>
{
    option.setName(PtuAutocompleteParameterName.MoveName);
    option.setDescription(description);
    return option.setAutocomplete(true);
};

export const pokemonTypeOption = (option: SlashCommandStringOption, description: string): SlashCommandStringOption =>
{
    const choices = Object.entries(PokemonType).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) =>
        {
            return {
                name: key,
                value,
            };
        },
    );

    option.setName('type');
    option.setDescription(description);
    return option.setChoices(
        ...choices,
    );
};

export const pokemonMoveCategoryOption = (option: SlashCommandStringOption, description: string): SlashCommandStringOption =>
{
    const choices = Object.entries(PokemonMoveCategory).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) =>
        {
            return {
                name: key,
                value,
            };
        },
    );

    option.setName('category');
    option.setDescription(description);
    return option.setChoices(
        ...choices,
    );
};
