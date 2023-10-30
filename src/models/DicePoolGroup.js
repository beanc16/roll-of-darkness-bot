const DicePool = require("./DicePool");

class DicePoolGroup
{
    constructor({ dicepool } = {})
    {
        this._dicepools = [];

        if (dicepool)
        {
            this.push(dicepool);
        }
    }

    get dicepools()
    {
        return this._dicepools;
    }

    get dicepoolResults()
    {
        return this._dicepools.map((dicepool) => dicepool.rollResults);
    }

    get(dicepoolIndex)
    {
        return this.dicepools[dicepoolIndex];
    }

    getNumOfSuccessesOfDicepoolAt(dicepoolIndex)
    {
        return this.get(dicepoolIndex)?.numOfSuccesses;
    }

    push(value = new DicePool())
    {
        this._dicepools.push(value);
    }

    forEach(callbackfn)
    {
        return this.dicepools.forEach(callbackfn);
    }

    map(callbackfn)
    {
        return this.dicepools.map(callbackfn);
    }

    reduce(callbackfn, initialValue)
    {
        return this.dicepools.reduce(callbackfn, initialValue);
    }

    getBiggestResult()
    {
        const biggestResult = this.reduce(function (acc, cur)
        {
            if (cur.numOfSuccesses > acc.numOfSuccesses)
            {
                acc = cur;
            }

            return acc;
        }, this.dicepools[0]);

        return biggestResult;
    }
}


module.exports = DicePoolGroup;
