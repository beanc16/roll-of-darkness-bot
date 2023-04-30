const rollConstants = require('../constants/roll');
const DicePool = require('../models/DicePool');

class DiceService
{
    constructor({
        sides = rollConstants.defaultParams.sides,
        count = rollConstants.defaultParams.count,
        rerollOnGreaterThanOrEqualTo = rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        exceptionalOn = rollConstants.defaultParams.exceptionalOn,
        isRote = rollConstants.defaultParams.isRote,
        isAdvancedAction = rollConstants.defaultParams.isAdvancedAction,
    } = rollConstants.defaultParams)
    {
        this.sides = sides || rollConstants.defaultParams.sides;
        this.count = count || rollConstants.defaultParams.count;
        this.rerollOnGreaterThanOrEqualTo = rerollOnGreaterThanOrEqualTo || rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo;
        this.successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo || rollConstants.defaultParams.successOnGreaterThanOrEqualTo;
        this.exceptionalOn = exceptionalOn || rollConstants.defaultParams.exceptionalOn;
        this.isRote = isRote || rollConstants.defaultParams.isRote;
        this.isAdvancedAction = isAdvancedAction || rollConstants.defaultParams.isAdvancedAction;
    }

    roll()
    {
        const dicepools = [this.rollDicepool()];

        if (this.isAdvancedAction)
        {
            dicepools.push(this.rollDicepool());
        }

        return dicepools;
    }

    rollDicepool()
    {
        const dicePool = new DicePool({
            exceptionalOn: this.exceptionalOn,
            successOnGreaterThanOrEqualTo: this.successOnGreaterThanOrEqualTo,
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

        // Determine the success status
        // TODO: Make class that handles this at the dicepool level instead
        /*
        const successStatus = (randomInteger >= this.exceptionalOn)
            ? categoriesSingleton.get('EXCEPTIONAL_SUCCESS')
            : (randomInteger >= this.successOnGreaterThanOrEqualTo)
            ? categoriesSingleton.get('SUCCESS')
            : categoriesSingleton.get('FAILURE');
        */

        rolls.push({
            number: randomInteger,
            isRote,
            //successStatus,
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
