import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import { PtuPokemon } from '../types/pokemon.js';

export interface FakemonState
{
    pokemon: Omit<PtuPokemon, 'versionName' | 'olderVersions' | 'extras'>;
}

export default new RecordSingleton<string, FakemonState>();
