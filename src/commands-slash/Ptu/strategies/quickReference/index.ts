import { QrDamageChartsStrategy } from './QrDamageChartsStrategy.js';
import { QrPokemonExperienceChartStrategy } from './QrPokemonExperienceChartStrategy.js';
import { QrPowerChartStrategy } from './QrPowerChartStrategy.js';
import { QrSwitchingPokemonStrategy } from './QrSwitchingPokemonStrategy.js';
import { QrTrainingPokemonStrategy } from './QrTrainingPokemonStrategy.js';
import { QrTypeChartStrategy } from './QrTypeChartStrategy.js';
import { QrWeightClassChartStrategy } from './QrWeightClassChartStrategy.js';

export default {
    [QrDamageChartsStrategy.key]: QrDamageChartsStrategy,
    [QrPokemonExperienceChartStrategy.key]: QrPokemonExperienceChartStrategy,
    [QrPowerChartStrategy.key]: QrPowerChartStrategy,
    [QrSwitchingPokemonStrategy.key]: QrSwitchingPokemonStrategy,
    [QrTrainingPokemonStrategy.key]: QrTrainingPokemonStrategy,
    [QrWeightClassChartStrategy.key]: QrWeightClassChartStrategy,
    [QrTypeChartStrategy.key]: QrTypeChartStrategy,
};
