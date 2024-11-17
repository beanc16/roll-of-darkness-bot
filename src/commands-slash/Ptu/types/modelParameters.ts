import { EqualityOption } from '../../options/shared.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuMoveFrequency,
} from './pokemon.js';

export interface GetLookupAbilityDataParameters
{
    name?: string | null;
    nameSearch?: string | null;
    frequencySearch?: string | null;
    effectSearch?: string | null;
}

export interface PtuMoveExclude
{
    names?: string[];
    rangeSearch?: string;
    weaponMovesAndManuevers?: boolean;
}

export interface GetLookupMoveDataParameters
{
    name?: string | null;
    type?: PokemonType | null;
    category?: PokemonMoveCategory | null;
    db?: number | null;
    dbEquality?: EqualityOption | null;
    frequency?: PtuMoveFrequency | null;
    ac?: number | null;
    acEquality?: EqualityOption | null;
    nameSearch?: string | null;
    rangeSearch?: string | null;
    effectSearch?: string | null;
    exclude?: PtuMoveExclude;
    sortBy?: 'all' | 'name' | 'type';
}
