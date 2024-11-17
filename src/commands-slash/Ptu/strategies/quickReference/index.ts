import { ChatIteractionStrategyRecord } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuQuickReferenceInfo } from '../../subcommand-groups/index.js';
import { QrDamageChartsStrategy } from './QrDamageChartsStrategy.js';
import { QrNatureChartStrategy } from './QrNatureChartStrategy.js';
import { QrPokemonExperienceChartStrategy } from './QrPokemonExperienceChartStrategy.js';
import { QrPowerChartStrategy } from './QrPowerChartStrategy.js';
import { QrSwitchingPokemonStrategy } from './QrSwitchingPokemonStrategy.js';
import { QrTrainingPokemonStrategy } from './QrTrainingPokemonStrategy.js';
import { QrTypeChartStrategy } from './QrTypeChartStrategy.js';
import { QrWeightClassChartStrategy } from './QrWeightClassChartStrategy.js';

export default {
    [QrDamageChartsStrategy.key]: QrDamageChartsStrategy,
    [QrNatureChartStrategy.key]: QrNatureChartStrategy,
    [QrPokemonExperienceChartStrategy.key]: QrPokemonExperienceChartStrategy,
    [QrPowerChartStrategy.key]: QrPowerChartStrategy,
    [QrSwitchingPokemonStrategy.key]: QrSwitchingPokemonStrategy,
    [QrTrainingPokemonStrategy.key]: QrTrainingPokemonStrategy,
    [QrWeightClassChartStrategy.key]: QrWeightClassChartStrategy,
    [QrTypeChartStrategy.key]: QrTypeChartStrategy,
} as ChatIteractionStrategyRecord<PtuQuickReferenceInfo>;
