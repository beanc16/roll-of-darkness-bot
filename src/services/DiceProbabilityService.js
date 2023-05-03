const rollConstants = require('../constants/roll');
const ProbabilityService = require('./ProbabilityService');

class DiceProbabilityService
{
    constructor()
    {
        this._probabilityService = new ProbabilityService();
    }

    getProbabilityOfRolling({
        numberOfDice = rollConstants.defaultParams.count,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        desiredNumberOfSuccesses = 1,
    })
    {
        const probabilityOfSuccessOnOneDiceRoll = (10 - successOnGreaterThanOrEqualTo + 1) / 10;

        const probabilityOfSuccess = this._probabilityService.getDiscreteBinomialDistribution({
            n: numberOfDice,
            p: probabilityOfSuccessOnOneDiceRoll,
            k: desiredNumberOfSuccesses,
        });

        return probabilityOfSuccess.toFixed(2) * 100;
    }
}



module.exports = DiceProbabilityService;
