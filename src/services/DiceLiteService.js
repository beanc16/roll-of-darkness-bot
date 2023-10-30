const DiceService = require('./DiceService');

class DiceLiteService
{
    constructor({
        sides,
        count,
    })
    {
        this._diceService = new DiceService({
            sides,
            count,
            rerollOnGreaterThanOrEqualTo: sides + 1,
        });
    }

    roll()
    {
        const dicePoolGroup = this._diceService.roll();
        const [rollResults] = dicePoolGroup.dicepoolResults;
        return rollResults;
    }
}



module.exports = DiceLiteService;
