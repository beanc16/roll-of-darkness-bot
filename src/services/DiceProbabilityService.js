const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');

const rollConstants = require('../constants/roll');

class DiceProbabilityService
{
    async getProbabilityOfRolling({
        numberOfDice = rollConstants.defaultParams.count,
        // successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        desiredNumberOfSuccesses = 1,
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
        } = await RollOfDarknessApi.probability.getDiceProbability({
            dice: numberOfDice,
            successes: desiredNumberOfSuccesses,
        });

        return {
            cumulativeProbability,
            individualProbability,
        };
    }
}



module.exports = DiceProbabilityService;
