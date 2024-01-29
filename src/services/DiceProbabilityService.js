const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');

const rollConstants = require('../constants/roll');

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
        console.log('\n data:', {
            dice: numberOfDice,
            successes: desiredNumberOfSuccesses,
            rerolls,
            rote,
            advancedAction,
        });
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
