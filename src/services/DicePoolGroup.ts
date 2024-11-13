import { DicePool } from './DicePool.js';

export class DicePoolGroup
{
    private _dicepools: DicePool[];

    constructor({ dicepool }: { dicepool?: DicePool } = {})
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
        return this._dicepools.map(dicepool => dicepool.rollResults);
    }

    get(dicepoolIndex: number)
    {
        return this.dicepools[dicepoolIndex];
    }

    getNumOfSuccessesOfDicepoolAt(dicepoolIndex: number)
    {
        return this.get(dicepoolIndex)?.numOfSuccesses;
    }

    push(value = new DicePool())
    {
        this._dicepools.push(value);
    }

    forEach(callbackfn: (value: DicePool, index: number, array: DicePool[]) => void)
    {
        return this.dicepools.forEach(callbackfn);
    }

    map<Response>(callbackfn: (value: DicePool, index: number, array: DicePool[]) => Response)
    {
        return this.dicepools.map(callbackfn);
    }

    reduce<Response>(callbackfn: (acc: Response, currentValue: DicePool, index: number, array: DicePool[]) => Response, initialValue: any)
    {
        return this.dicepools.reduce(callbackfn, initialValue);
    }

    getBiggestResult()
    {
        const biggestResult = this.reduce<DicePool>((acc, cur) =>
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
