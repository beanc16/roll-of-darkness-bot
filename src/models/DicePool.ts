import rollConstants from '../constants/roll.js';
import { Roll } from '../types/rolls.js';

export interface DicePoolOptions
{
    successOnGreaterThanOrEqualTo?: number;
    extraSuccesses?: number;
}

export class DicePool
{
    private _rolls: Roll[][];
    private successOnGreaterThanOrEqualTo: number;
    private extraSuccesses: number;
    private _numOfSuccesses?: number;

    constructor({
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        extraSuccesses = rollConstants.defaultParams.extraSuccesses,
    }: DicePoolOptions = {})
    {
        this._rolls = [];
        this.successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo;
        this.extraSuccesses = extraSuccesses;
    }

    get rolls(): Roll[][]
    {
        return this._rolls;
    }

    get rollResults(): number[]
    {
        return this._rolls.flatMap((array) => array.map(({ number }) => number));
    }

    get numOfSuccesses(): number
    {
        if (this._numOfSuccesses === undefined)
        {
            const successfulDiceRolled = this.rolls.flat().filter((result) =>
            {
                return (result.number >= this.successOnGreaterThanOrEqualTo);
            });

            const extraSuccesses = (successfulDiceRolled.length > 0)
                ? this.extraSuccesses
                : 0;

            this._numOfSuccesses = successfulDiceRolled.length + extraSuccesses;
        }

        return this._numOfSuccesses;
    }

    push(value: Roll[])
    {
        this._rolls.push(value);
    }

    forEach(callbackfn: (value: Roll[], index: number, array: Roll[][]) => void)
    {
        return this.rolls.forEach(callbackfn);
    }

    map<Response>(callbackfn: (value: Roll[], index: number, array: Roll[][]) => Response)
    {
        return this.rolls.map(callbackfn);
    }

    reduce<Response>(callbackfn: (acc: Response, currentValue: Roll[], index: number, array: Roll[][]) => Response, initialValue: any)
    {
        return this.rolls.reduce(callbackfn, initialValue);
    }
}
