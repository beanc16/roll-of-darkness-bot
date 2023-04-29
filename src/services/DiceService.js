const rollConstants = require('../constants/roll');

class DiceService
{
    constructor({
        sides = rollConstants.defaultParams.sides,
        count = rollConstants.defaultParams.count,
        rerollOnGreaterThanOrEqualTo = rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        isRote = rollConstants.defaultParams.isRote,
    } = rollConstants.defaultParams)
    {
        this.sides = sides || rollConstants.defaultParams.sides;
        this.count = count || rollConstants.defaultParams.count;
        this.rerollOnGreaterThanOrEqualTo = rerollOnGreaterThanOrEqualTo || rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo;
        this.successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo || rollConstants.defaultParams.successOnGreaterThanOrEqualTo;
        this.isRote = isRote || rollConstants.defaultParams.isRote;
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
