import { RollOfDarknessProbabiltityDiceGetParameters } from '@beanc16/microservices-abstraction';
import rollConstants from '../constants/roll.js';
import { CachedRollOfDarknessApi } from '../services/CachedRollOfDarknessApi.js';

export default class DiceProbabilityService
{
    async getProbabilityOfRolling({
        numberOfDice = rollConstants.defaultParams.count,
        desiredNumberOfSuccesses = 1,
        rerolls = '10again',
        rote = false,
        advancedAction = false,
    }: {
        numberOfDice?: RollOfDarknessProbabiltityDiceGetParameters['dice'];
        desiredNumberOfSuccesses?: RollOfDarknessProbabiltityDiceGetParameters['successes'];
        rerolls?: RollOfDarknessProbabiltityDiceGetParameters['rerolls'];
        rote?: RollOfDarknessProbabiltityDiceGetParameters['rote'] | null;
        advancedAction?: RollOfDarknessProbabiltityDiceGetParameters['advancedAction'] | null;
    } = {})
    {
        /*
         * Cumulative probability is the probability of getting
         * AT LEAST the given number of successes on the given
         * number of dice.
         *
         * Individual probability is the probability of getting
         * EXACTLY the given number of successes on the given
         * number of dice.
         */
        const {
            cumulative_probability: cumulativeProbability,
            individual_probability: individualProbability,
        } = await CachedRollOfDarknessApi.probability.getDiceProbability({
            dice: numberOfDice,
            successes: desiredNumberOfSuccesses,
            rerolls,
            rote: rote as boolean,
            advancedAction: advancedAction as boolean,
        });

        return {
            cumulativeProbability,
            individualProbability,
        };
    }
}