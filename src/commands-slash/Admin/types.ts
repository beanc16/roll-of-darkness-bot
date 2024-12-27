import { NwodAutocompleteParameterName } from '../Nwod/types/lookup.js';
import { PtuAutocompleteParameterName } from '../Ptu/types/autocomplete.js';

export enum RefreshCacheCommand
{
    Nwod = 'nwod',
    Ptu = 'ptu',
}

type UnparsedSubcommandForRefreshCache = `/${RefreshCacheCommand} lookup ${NwodAutocompleteParameterName | Exclude<PtuAutocompleteParameterName, PtuAutocompleteParameterName.PokemonName>}`;
export type RemoveNameSuffix<T> = T extends `${infer Prefix}_name` ? Prefix : T;

export type CommandForRefreshCache = RemoveNameSuffix<UnparsedSubcommandForRefreshCache>;
export type SplitCommandForRefreshCache = [
    RefreshCacheCommand,
    'lookup',
    RemoveNameSuffix<NwodAutocompleteParameterName | Exclude<PtuAutocompleteParameterName, PtuAutocompleteParameterName.PokemonName>>,
];
