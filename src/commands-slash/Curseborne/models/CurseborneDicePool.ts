import { DicePool } from '../../../models/DicePool.js';

export class CurseborneDicePool
{
    private dicePool: DicePool;
    private twoSuccessesOn: number;

    constructor({
        dicePool,
        twoSuccessesOn,
    }: {
        dicePool: DicePool;
        twoSuccessesOn: number;
    })
    {
        this.dicePool = dicePool;
        this.twoSuccessesOn = twoSuccessesOn;
    }

    get numOfSuccesses()
    {
        const numOfSuccesses = this.dicePool.numOfSuccesses;

        return this.dicePool.reduce<number>((acc, cur) =>
        {
            // Add 1 to numOfSuccesses for each roll above twoSuccessesOn
            cur.forEach((roll) =>
            {
                if (roll.number >= this.twoSuccessesOn)
                {
                    acc += 1;
                }
            });

            return acc;
        }, 0 + numOfSuccesses);
    }

    get rollResults()
    {
        return this.dicePool.rollResults;
    }
}
