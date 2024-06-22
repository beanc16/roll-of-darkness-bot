const { Text } = require('@beanc16/discordjs-helpers');
const ResponseFormatterService = require('./ResponseFormatterService');

class CoinFlipResponseFormatterService extends ResponseFormatterService
{
    constructor({
        authorId,
        headsOrTails,
        result,
    } = {})
    {
        super({
            authorId,
        });
        this.headsOrTails = headsOrTails;
        this.result = result;
        this.successfullyPredictedResult = (result === headsOrTails);
    }

    getRandomFlavorText()
    {
        // TODO: Make the API handle this later
        if (this.successfullyPredictedResult) {
            return 'You must be so proud of successfully predicting the correct answer to a 50% chance.';
        } else {
            return `It's okay, we can't all be right.`;
        }
    }

    getResponse()
    {
        return `${this.authorPing} flipped a coin, predicted that it would be ${Text.bold(this.headsOrTails)}, and got ${Text.bold(this.result)}. ${this.getRandomFlavorText()}`;
    }
}



module.exports = CoinFlipResponseFormatterService;
