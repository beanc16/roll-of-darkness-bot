import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import { PtuPokemon } from '../types/pokemon.js';

export interface FakemonState
{
    key: string;
    pokemon: Omit<PtuPokemon, 'versionName' | 'olderVersions' | 'extras'>;
}

export default new RecordSingleton<string, FakemonState>();
