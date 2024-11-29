import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import { NwodAutocompleteParameterName } from '../../Nwod/types/lookup.js';
import { PtuAutocompleteParameterName } from '../../Ptu/types/autocomplete.js';

export enum AdminSubcommand
{
    RefreshCache = 'refresh_cache',
}

export enum RefreshCacheCommand
{
    Nwod = 'nwod',
    Ptu = 'ptu',
}

const nwodSubcommandsForRefreshCache = Object.values(NwodAutocompleteParameterName)
    .map(value => value);

const ptuSubcommandsForRefreshCache = Object.values(PtuAutocompleteParameterName)
    .map(value => value)
    .filter(value => value !== PtuAutocompleteParameterName.PokemonName);

export const subcommandsForRefreshCache = [
    ...nwodSubcommandsForRefreshCache,
    ...ptuSubcommandsForRefreshCache,
];

export type SubcommandForRefreshCache = typeof subcommandsForRefreshCache[0];

export const refreshCache = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(AdminSubcommand.RefreshCache);
    subcommand.setDescription('Pull fresh data for the given command rather than using what was pulled on startup.');

    const commandChoices = Object.values(RefreshCacheCommand).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    subcommand.addStringOption((option) =>
    {
        option.setName('command');
        option.setDescription('The command to refresh the cache for.');
        option.addChoices(...commandChoices);
        return option.setRequired(true);
    });

    const subcommandChoices = subcommandsForRefreshCache.map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name: name.replace('_name', ''),
                value: name,
            };
        },
    );
    subcommand.addStringOption((option) =>
    {
        option.setName('subcommand');
        option.setDescription('The subcommand to refresh the cache for.');
        option.addChoices(...subcommandChoices);
        return option.setRequired(true);
    });

    return subcommand;
};
