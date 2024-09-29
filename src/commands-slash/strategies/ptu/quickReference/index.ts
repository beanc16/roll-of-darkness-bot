import { QrDamageChartsStrategy } from './QrDamageChartsStrategy.js';
import { QrNatureChartStrategy } from './QrNatureChartStrategy.js';
import { QrPokemonExperienceChartStrategy } from './QrPokemonExperienceChartStrategy.js';
import { QrSwitchingPokemonStrategy } from './QrSwitchingPokemonStrategy.js';
import { QrTrainingPokemonStrategy } from './QrTrainingPokemonStrategy.js';
import { QrTypeChartStrategy } from './QrTypeChartStrategy.js';

export default {
    [QrDamageChartsStrategy.key]: QrDamageChartsStrategy,
    [QrNatureChartStrategy.key]: QrNatureChartStrategy,
    [QrPokemonExperienceChartStrategy.key]: QrPokemonExperienceChartStrategy,
    [QrSwitchingPokemonStrategy.key]: QrSwitchingPokemonStrategy,
    [QrTrainingPokemonStrategy.key]: QrTrainingPokemonStrategy,
    [QrTypeChartStrategy.key]: QrTypeChartStrategy,
};
