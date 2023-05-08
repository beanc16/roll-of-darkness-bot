const rollConstants = require('../constants/roll');
const DicePoolGroup = require('../models/DicePoolGroup');
const DicePool = require('../models/DicePool');

class DiceService
{
    constructor({
        sides = rollConstants.defaultParams.sides,
        count = rollConstants.defaultParams.count,
        rerollOnGreaterThanOrEqualTo = rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        exceptionalOn = rollConstants.defaultParams.exceptionalOn,
        canBeDramaticFailure = rollConstants.defaultParams.canBeDramaticFailure,
        isRote = rollConstants.defaultParams.isRote,
        isAdvancedAction = rollConstants.defaultParams.isAdvancedAction,
        extraSuccesses = rollConstants.defaultParams.extraSuccesses,
    } = rollConstants.defaultParams)
    {
        this.sides = sides || rollConstants.defaultParams.sides;
        this.count = count || rollConstants.defaultParams.count;
        this.rerollOnGreaterThanOrEqualTo = rerollOnGreaterThanOrEqualTo || rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo;
        this.successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo || rollConstants.defaultParams.successOnGreaterThanOrEqualTo;
        this.exceptionalOn = exceptionalOn || rollConstants.defaultParams.exceptionalOn;
        this.canBeDramaticFailure = canBeDramaticFailure || rollConstants.defaultParams.canBeDramaticFailure
        this.isRote = isRote || rollConstants.defaultParams.isRote;
        this.isAdvancedAction = isAdvancedAction || rollConstants.defaultParams.isAdvancedAction;
        this.extraSuccesses = extraSuccesses || rollConstants.defaultParams.extraSuccesses;
    }

    roll()
    {
        const dicePoolGroup = new DicePoolGroup({
            dicepool: this.rollDicepool(),
        });

        if (this.isAdvancedAction)
        {
            dicePoolGroup.push(this.rollDicepool());
        }

        return dicePoolGroup;
    }

    rollDicepool()
    {
        const dicePool = new DicePool({
            exceptionalOn: this.exceptionalOn,
            successOnGreaterThanOrEqualTo: this.successOnGreaterThanOrEqualTo,
            canBeDramaticFailure: this.canBeDramaticFailure,
            extraSuccesses: this.extraSuccesses,
        });

        for (let i = 0; i < this.count; i++)
        {
            const result = this.rollOne();
            dicePool.push(result);
        }

        return dicePool;
    }

    rollOne({
        isReroll = false,
        isRote = false,
    } = {})
    {
        const rolls = [];

        // Get a random integer between 1 and sides (inclusive)
        const randomDecimal = Math.random() * this.sides;
        const randomInteger = Math.floor(randomDecimal) + 1;

        rolls.push({
            number: randomInteger,
            isRote,
        });

        if (randomInteger >= this.rerollOnGreaterThanOrEqualTo)
        {
            const results = this.rollOne({ isReroll: true });
            rolls.push(...results);
        }

        if (!isReroll && this.isRote && randomInteger < this.successOnGreaterThanOrEqualTo)
        {
            const results = this.rollOne({
                isReroll: true,
                isRote: true,
            });
            rolls.push(...results);
        }

        return rolls;
    }
}



module.exports = DiceService;
