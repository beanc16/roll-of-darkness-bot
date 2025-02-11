import { QrActionTypesStrategy } from './QrActionTypesStrategy.js';
import { QrBookMechanicsStrategy } from './QrBookMechanicsStrategy.js';
import { QrCoupDeGraceStrategy } from './QrCoupDeGraceStrategy.js';
import { QrDamageChartsStrategy } from './QrDamageChartsStrategy.js';
import { QrDamageFormulaStrategy } from './QrDamageFormulaStrategy.js';
import { QrPokemonExperienceChartStrategy } from './QrPokemonExperienceChartStrategy.js';
import { QrPowerChartStrategy } from './QrPowerChartStrategy.js';
import { QrSwitchingPokemonStrategy } from './QrSwitchingPokemonStrategy.js';
import { QrTrainingPokemonStrategy } from './QrTrainingPokemonStrategy.js';
import { QrTypeChartStrategy } from './QrTypeChartStrategy.js';
import { QrWeightClassChartStrategy } from './QrWeightClassChartStrategy.js';

export default {
    [QrActionTypesStrategy.key]: QrActionTypesStrategy,
    [QrBookMechanicsStrategy.key]: QrBookMechanicsStrategy,
    [QrCoupDeGraceStrategy.key]: QrCoupDeGraceStrategy,
    [QrDamageChartsStrategy.key]: QrDamageChartsStrategy,
    [QrDamageFormulaStrategy.key]: QrDamageFormulaStrategy,
    [QrPokemonExperienceChartStrategy.key]: QrPokemonExperienceChartStrategy,
    [QrPowerChartStrategy.key]: QrPowerChartStrategy,
    [QrSwitchingPokemonStrategy.key]: QrSwitchingPokemonStrategy,
    [QrTrainingPokemonStrategy.key]: QrTrainingPokemonStrategy,
    [QrWeightClassChartStrategy.key]: QrWeightClassChartStrategy,
    [QrTypeChartStrategy.key]: QrTypeChartStrategy,
};
