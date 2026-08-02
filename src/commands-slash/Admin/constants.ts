import { NwodAutocompleteParameterName } from '../Nwod/types/lookup.js';
import { PtuAutocompleteParameterName } from '../Ptu/types/autocomplete.js';
import {
    CommandForRefreshCache,
    RefreshCacheCommand,
    RemoveNameSuffix,
} from './types.js';

const ptuAutocompleteParameterNamesToIgnore = new Set([
    PtuAutocompleteParameterName.PokemonName,
    PtuAutocompleteParameterName.PokemonToEvolve,
    PtuAutocompleteParameterName.Ability1,
    PtuAutocompleteParameterName.Ability2,
    PtuAutocompleteParameterName.Ability3,
]);

const nwodSubcommandsForRefreshCache = Object.values(NwodAutocompleteParameterName)
    .map(value => value);

const ptuSubcommandsForRefreshCache = Object.values(PtuAutocompleteParameterName)
    .map(value => value)
    .filter(value => !ptuAutocompleteParameterNamesToIgnore.has(value));

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
