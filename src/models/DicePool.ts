import rollConstants from '../constants/roll.js';
import { Roll } from '../types/rolls.js';
import categoriesSingleton from './categoriesSingleton.js';

export class DicePool
{
    private _rolls: Roll[][];
    private _exceptionalOn: number;
    private _successOnGreaterThanOrEqualTo: number;
    private _canBeDramaticFailure: boolean;
    private _extraSuccesses: number;
    private _numOfSuccesses?: number;

    constructor({
        exceptionalOn = rollConstants.defaultParams.exceptionalOn,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        canBeDramaticFailure = rollConstants.defaultParams.canBeDramaticFailure,
        extraSuccesses = rollConstants.defaultParams.extraSuccesses,
    }: {
        exceptionalOn?: number;
        successOnGreaterThanOrEqualTo?: number;
        canBeDramaticFailure?: boolean;
        extraSuccesses?: number;
    } = {})
    {
        this._rolls = [];
        this._exceptionalOn = exceptionalOn || rollConstants.defaultParams.exceptionalOn;
        this._successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo || rollConstants.defaultParams.successOnGreaterThanOrEqualTo;
        this._canBeDramaticFailure = canBeDramaticFailure || rollConstants.defaultParams.canBeDramaticFailure;
        this._extraSuccesses = extraSuccesses || rollConstants.defaultParams.extraSuccesses;
    }

    get rolls()
    {
        return this._rolls;
    }

    get rollResults()
    {
        return this._rolls.flatMap((array) => array.map(({ number }) => number));
    }

    get numOfSuccesses()
    {
        if (!this._numOfSuccesses)
        {
            const successfulDiceRolled = this.rolls.flat().filter((result) =>
            {
                return (result.number >= this._successOnGreaterThanOrEqualTo);
            });

            const extraSuccesses = (successfulDiceRolled.length > 0)
                ? this._extraSuccesses
                : 0;

            this._numOfSuccesses = successfulDiceRolled.length + extraSuccesses;
        }

        return this._numOfSuccesses;
    }

    get successStatus()
    {
        if (this.numOfSuccesses >= this._exceptionalOn)
        {
            return categoriesSingleton.get('EXCEPTIONAL_SUCCESS');
        }
        
        else if (this.numOfSuccesses > 0)
        {
            return categoriesSingleton.get('SUCCESS');
        }

        else if (
            this._canBeDramaticFailure
            && this.rolls?.length === 1
            && this.rolls[0]
            && this.rolls[0]?.length === 1
            && this.rolls[0][0]?.number === 1
        )
        {
            return categoriesSingleton.get('DRAMATIC_FAILURE');
        }

        return categoriesSingleton.get('FAILURE');
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
