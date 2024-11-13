import rollConstants from '../constants/roll.js';
import { Roll } from '../types/rolls.js';

export class DicePool
{
    private _rolls: Roll[][];
    private _successOnGreaterThanOrEqualTo: number;
    private _extraSuccesses: number;
    private _numOfSuccesses?: number;

    constructor({
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        extraSuccesses = rollConstants.defaultParams.extraSuccesses,
    }: {
        successOnGreaterThanOrEqualTo?: number;
        extraSuccesses?: number;
    } = {})
    {
        this._rolls = [];
        this._successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo || rollConstants.defaultParams.successOnGreaterThanOrEqualTo;
        this._extraSuccesses = extraSuccesses || rollConstants.defaultParams.extraSuccesses;
    }

    get rolls()
    {
        return this._rolls;
    }

    get rollResults()
    {
        return this._rolls.flatMap(array => array.map(({ number }) => number));
    }

    get numOfSuccesses()
    {
        if (!this._numOfSuccesses)
        {
            const successfulDiceRolled = this.rolls.flat().filter(result =>
                (result.number >= this._successOnGreaterThanOrEqualTo)
            );

            const extraSuccesses = (successfulDiceRolled.length > 0)
                ? this._extraSuccesses
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
