const defaultParams = {
    sides: 10,
    count: 1,
    rerollOnGreaterThanOrEqualTo: 10,
};

class DiceService
{
    constructor({
        sides = defaultParams.sides,
        count = defaultParams.count,
        rerollOnGreaterThanOrEqualTo = defaultParams.rerollOnGreaterThanOrEqualTo,
    } = defaultParams)
    {
        this.sides = sides;
        this.count = count;
        this.rerollOnGreaterThanOrEqualTo = rerollOnGreaterThanOrEqualTo;
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
