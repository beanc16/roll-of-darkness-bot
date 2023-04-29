const rollConstants = require('../constants/roll');

class DiceService
{
    constructor({
        sides = rollConstants.defaultParams.sides,
        count = rollConstants.defaultParams.count,
        rerollOnGreaterThanOrEqualTo = rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo,
    } = rollConstants.defaultParams)
    {
        this.sides = sides || rollConstants.defaultParams.sides;
        this.count = count || rollConstants.defaultParams.count;
        this.rerollOnGreaterThanOrEqualTo = rerollOnGreaterThanOrEqualTo || rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo;
    }

    roll()
    {
        const rolls = [];

        for (let i = 0; i < this.count; i++)
        {
            const result = this.rollOne();
            rolls.push(result);
        }

        return rolls;
    }

    rollOne()
    {
        const rolls = [];

        // Get a random integer between 1 and sides (inclusive)
        const randomDecimal = Math.random() * this.sides;
        const randomInteger = Math.floor(randomDecimal) + 1;
        rolls.push(randomInteger);

        if (randomInteger >= this.rerollOnGreaterThanOrEqualTo)
        {
            const results = this.rollOne();
            rolls.push(...results);
        }

        return rolls;
    }
}



module.exports = DiceService;
