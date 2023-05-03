const ResponseFormatterService = require("./ResponseFormatterService");

class ProbabilityResponseFormatterService extends ResponseFormatterService
{
    constructor({
        authorId,
        desiredNumberOfSuccesses,
        numberOfDice,
        probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
    })
    {
        super({
            authorId,
        });
        this.desiredNumberOfSuccesses = desiredNumberOfSuccesses;
        this.numberOfDice = numberOfDice;
        this.probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice = probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice;
    }

    getResponse()
    {
        return `${this.authorPing}, you have a ${this.probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice}% chance of getting ${this.desiredNumberOfSuccesses} successes with ${this.numberOfDice} dice.`;
    }
}



module.exports = ProbabilityResponseFormatterService;
