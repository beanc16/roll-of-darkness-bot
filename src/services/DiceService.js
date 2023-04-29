const defaultParams = {
    sides: 10,
    count: 1,
};

class DiceService
{
    roll({
        sides = defaultParams.sides,
        count = defaultParams.count,
    } = defaultParams)
    {
        const rolls = [];

        for (let i = 0; i < count; i++)
        {
            const result = this.rollOne({ sides });
            rolls.push(result);
        }

        return rolls;
    }

    rollOne({
        sides = defaultParams.sides,
    } = defaultParams)
    {
        // Get a random integer between 1 and sides (inclusive)
        const randomDecimal = Math.random() * sides;
        const randomInteger = Math.floor(randomDecimal) + 1;
        return randomInteger;
    }
}



module.exports = new DiceService();
