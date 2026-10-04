import type { PtuPokemonForLookupPokemon } from '../embed-messages/lookup.js';
import { createPtuPokemonCollectionData } from './PtuPokemonCollection.fakes.js';

type PtuPokemonFakeArgs = NonNullable<Parameters<typeof createPtuPokemonCollectionData>[0]>
    & Partial<Pick<
        PtuPokemonForLookupPokemon,
        'versionName' | 'olderVersions' | 'typeShifts' | 'groupedVersions'
    >>;

export const createPtuPokemonData = ({
    versionName,
    olderVersions = [],
    typeShifts = [],
    groupedVersions = [],
    ...collectionArgs
}: PtuPokemonFakeArgs = {}): PtuPokemonForLookupPokemon =>
{
    const {
        _id,
        edits: _edits,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        toPtuPokemon: _toPtuPokemon,
        ...pokemon
    } = createPtuPokemonCollectionData(collectionArgs);

    return {
        ...pokemon,
        versionName: versionName ?? pokemon.name,
        olderVersions,
        typeShifts,
        groupedVersions,
    };
};

export const createPtuPokemonDataBulk = (overrides: PtuPokemonFakeArgs[]): PtuPokemonForLookupPokemon[] =>
    overrides.map(override => createPtuPokemonData(override));
