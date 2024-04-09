const rollConstants = require('../constants/roll');
const CachedRollOfDarknessApi = require('../services/CachedRollOfDarknessApi');

class DiceProbabilityService
{
    async getProbabilityOfRolling({
        numberOfDice = rollConstants.defaultParams.count,
        desiredNumberOfSuccesses = 1,
        rerolls = '10again',
        rote = false,
        advancedAction = false,
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
            rote,
            advancedAction,
        });

        return {
            cumulativeProbability,
            individualProbability,
        };
    }
}



module.exports = DiceProbabilityService;
