import rollConstants from './rollConstants.js';
import { Roll } from './types.js';

export interface DicePoolOptions
{
    successOnGreaterThanOrEqualTo?: number;
    extraSuccesses?: number;
}

export class DicePool
{
    private rollsList: Roll[][];
    private successOnGreaterThanOrEqualTo: number;
    private extraSuccesses: number;
    private successCount?: number;

    // eslint-disable-next-line newline-destructuring/newline -- Allow two properties to go on separate lines for long defaulting
    constructor({
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        extraSuccesses = rollConstants.defaultParams.extraSuccesses,
    }: DicePoolOptions = {})
    {
        this.rollsList = [];
        this.successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo;
        this.extraSuccesses = extraSuccesses;
    }

    get rolls(): Roll[][]
    {
        return this.rollsList;
    }

    get rollResults(): number[]
    {
        return this.rolls.flatMap(array => array.map(({ number }) => number));
    }

    get numOfSuccesses(): number
    {
        if (this.successCount === undefined)
        {
            const successfulDiceRolled = this.rolls.flat().filter(result =>
                (result.number >= this.successOnGreaterThanOrEqualTo),
            );

            const extraSuccesses = (successfulDiceRolled.length > 0)
                ? this.extraSuccesses
                : 0;

            this.successCount = successfulDiceRolled.length + extraSuccesses;
        }

        return this.successCount;
    }

    public push(value: Roll[]): void
    {
        this.rollsList.push(value);
    }

    public forEach(callbackfn: (value: Roll[], index: number, array: Roll[][]) => void): void
    {
        this.rolls.forEach(callbackfn);
    }

    public map<Response>(callbackfn: (value: Roll[], index: number, array: Roll[][]) => Response): Response[]
    {
        return this.rolls.map(callbackfn);
    }

    public reduce<Response>(callbackfn: (
        acc: Response,
        currentValue: Roll[],
        index: number,
        array: Roll[][],
    ) => Response, initialValue: Response): Response
    {
        return this.rolls.reduce(callbackfn, initialValue);
    }
}
