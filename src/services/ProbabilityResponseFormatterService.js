const ResponseFormatterService = require("./ResponseFormatterService");

class ProbabilityResponseFormatterService extends ResponseFormatterService
{
    constructor({
        authorId,
        desiredNumberOfSuccesses,
        numberOfDice,
        probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
        roundToDecimalPlaces = 0,
    })
    {
        super({
            authorId,
        });
        this.desiredNumberOfSuccesses = desiredNumberOfSuccesses;
        this.numberOfDice = numberOfDice;
        this.probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice = probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice.toFixed(roundToDecimalPlaces);
    }

    getResponse()
    {
        return `${this.authorPing}, you have a ${this.probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice}% chance of getting ${this.desiredNumberOfSuccesses} ${this.getSuccessesAsSingularOrPlural(this.desiredNumberOfSuccesses)} with ${this.numberOfDice} dice.`;
    }
}



module.exports = ProbabilityResponseFormatterService;
