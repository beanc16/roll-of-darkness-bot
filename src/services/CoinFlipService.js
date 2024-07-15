const { DiceService } = require('./DiceService');
const { coinFlipResultsEnum } = require('../constants/coinFlip');

class CoinFlipService
{
    constructor()
    {
        this._diceService = new DiceService({
            sides: 2,
        });
    }

    flip()
    {
        const result = this._diceService.roll();

        if (result?.get(0)?.rolls[0][0].number === 1) {
            return coinFlipResultsEnum.heads;
        }

        return coinFlipResultsEnum.tails;
    }
}



module.exports = CoinFlipService;
