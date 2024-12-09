import { ChatIteractionStrategyRecord } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { RandomApricornStrategy } from './RandomApricornStrategy.js';
import { RandomBerryStrategy } from './RandomBerryStrategy.js';
import { RandomDowsingRodStrategy } from './RandomDowsingRodStrategy.js';
import { RandomEvolutionaryStoneStrategy } from './RandomEvolutionaryStoneStrategy.js';
import { RandomFortuneStrategy } from './RandomFortuneStrategy.js';
import { RandomHealingItemStrategy } from './RandomHealingItemStrategy.js';
import { RandomHeldItemStrategy } from './RandomHeldItemStrategy.js';
import { RandomMetronomeStrategy } from './RandomMetronomeStrategy.js';
import { RandomNatureStrategy } from './RandomNatureStrategy.js';
import { RandomPickupStrategy } from './RandomPickupStrategy.js';
import { RandomPokeballStrategy } from './RandomPokeballStrategy.js';
import { RandomTmStrategy } from './RandomTmStrategy.js';
import { RandomVitaminStrategy } from './RandomVitaminStrategy.js';
import { RandomXItemStrategy } from './RandomXItemStrategy.js';

export default {
    [RandomApricornStrategy.key]: RandomApricornStrategy,
    [RandomBerryStrategy.key]: RandomBerryStrategy,
    [RandomDowsingRodStrategy.key]: RandomDowsingRodStrategy,
    [RandomEvolutionaryStoneStrategy.key]: RandomEvolutionaryStoneStrategy,
    [RandomFortuneStrategy.key]: RandomFortuneStrategy,
    [RandomHealingItemStrategy.key]: RandomHealingItemStrategy,
    [RandomHeldItemStrategy.key]: RandomHeldItemStrategy,
    [RandomMetronomeStrategy.key]: RandomMetronomeStrategy,
    [RandomNatureStrategy.key]: RandomNatureStrategy,
    [RandomPickupStrategy.key]: RandomPickupStrategy,
    [RandomPokeballStrategy.key]: RandomPokeballStrategy,
    [RandomTmStrategy.key]: RandomTmStrategy,
    [RandomVitaminStrategy.key]: RandomVitaminStrategy,
    [RandomXItemStrategy.key]: RandomXItemStrategy,
} as ChatIteractionStrategyRecord<PtuRandomSubcommand>;
