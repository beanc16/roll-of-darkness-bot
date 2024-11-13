import { DicePool } from './DicePool.js';

export class DicePoolGroup
{
    private dicepoolList: DicePool[];

    constructor({ dicepool }: { dicepool?: DicePool } = {})
    {
        this.dicepoolList = [];

        if (dicepool)
        {
            this.push(dicepool);
        }
    }

    get dicepools(): DicePool[]
    {
        return this.dicepoolList;
    }

    get dicepoolResults(): number[][]
    {
        return this.dicepoolList.map(dicepool => dicepool.rollResults);
    }

    public get(dicepoolIndex: number): DicePool
    {
        return this.dicepools[dicepoolIndex];
    }

    public getNumOfSuccessesOfDicepoolAt(dicepoolIndex: number): number

    {
        return this.get(dicepoolIndex)?.numOfSuccesses;
    }

    public push(value = new DicePool()): void
    {
        this.dicepoolList.push(value);
    }

    public forEach(callbackfn: (value: DicePool, index: number, array: DicePool[]) => void): void
    {
        this.dicepools.forEach(callbackfn);
    }

    public map<Response>(callbackfn: (value: DicePool, index: number, array: DicePool[]) => Response): Response[]
    {
        return this.dicepools.map(callbackfn);
    }

    public reduce<Response>(callbackfn: (
        acc: Response,
        currentValue: DicePool,
        index: number,
        array: DicePool[],
    ) => Response, initialValue: any): Response
    {
        return this.dicepools.reduce(callbackfn, initialValue);
    }

    public getBiggestResult(): DicePool
    {
        const biggestResult = this.reduce<DicePool>((acc, cur) =>
        {
            if (cur.numOfSuccesses > acc.numOfSuccesses)
            {
                return cur;
            }

            return acc;
        }, this.dicepools[0]);

        return biggestResult;
    }
}
