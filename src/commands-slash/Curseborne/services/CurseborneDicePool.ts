import { DicePool } from '../../../services/Dice/DicePool.js';

export class CurseborneDicePool
{
    private dicePool: DicePool;
    private twoSuccessesOn: number;

    constructor({ dicePool, twoSuccessesOn }: {
        dicePool: DicePool;
        twoSuccessesOn: number;
    })
    {
        this.dicePool = dicePool;
        this.twoSuccessesOn = twoSuccessesOn;
    }

    get numOfSuccesses(): number
    {
        const { numOfSuccesses } = this.dicePool;

        return this.dicePool.reduce<number>((acc, cur) =>
        {
            // Add 1 to numOfSuccesses for each roll above twoSuccessesOn
            const newAcc = cur.reduce<number>((acc2, roll) =>
            {
                if (roll.number >= this.twoSuccessesOn)
                {
                    return acc2 + 1;
                }

                return acc2;
            }, 0 + acc);

            return newAcc;
        }, 0 + numOfSuccesses);
    }

    get rollResults(): number[]
    {
        return this.dicePool.rollResults;
    }
}
