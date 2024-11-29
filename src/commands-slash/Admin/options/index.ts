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

export const commandsForRefresh = [
    ...nwodSubcommandsForRefreshCache.map<CommandForRefreshCache>(value =>
        `/${RefreshCacheCommand.Nwod} lookup ${
            value.replace('_name', '') as RemoveNameSuffix<NwodAutocompleteParameterName>
        }`,
    ),
    ...ptuSubcommandsForRefreshCache.map<CommandForRefreshCache>(value =>
        `/${RefreshCacheCommand.Ptu} lookup ${
            value.replace('_name', '') as RemoveNameSuffix<Exclude<PtuAutocompleteParameterName, PtuAutocompleteParameterName.PokemonName>>
        }`,
    ),
];

type UnparsedSubcommandForRefreshCache = `/${RefreshCacheCommand} lookup ${NwodAutocompleteParameterName | Exclude<PtuAutocompleteParameterName, PtuAutocompleteParameterName.PokemonName>}`;
type RemoveNameSuffix<T> = T extends `${infer Prefix}_name` ? Prefix : T;
export type CommandForRefreshCache = RemoveNameSuffix<UnparsedSubcommandForRefreshCache>;
export type SplitCommandForRefreshCache = [
    RefreshCacheCommand,
    'lookup',
    RemoveNameSuffix<NwodAutocompleteParameterName | Exclude<PtuAutocompleteParameterName, PtuAutocompleteParameterName.PokemonName>>,
];

export const refreshCache = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(AdminSubcommand.RefreshCache);
    subcommand.setDescription('Pull fresh data for the given command rather than using what was pulled on startup.');

    const commandChoices = commandsForRefresh.map<APIApplicationCommandOptionChoice<string>>(
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

    return subcommand;
};
