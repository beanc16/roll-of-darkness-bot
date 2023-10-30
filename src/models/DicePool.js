const rollConstants = require('../constants/roll');
const categoriesSingleton = require('./categoriesSingleton');

class DicePool
{
    constructor({
        exceptionalOn = rollConstants.defaultParams.exceptionalOn,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        canBeDramaticFailure = rollConstants.defaultParams.canBeDramaticFailure,
        extraSuccesses = rollConstants.defaultParams.extraSuccesses,
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

    push(value)
    {
        this._rolls.push(value);
    }

    forEach(callbackfn)
    {
        return this.rolls.forEach(callbackfn);
    }

    map(callbackfn)
    {
        return this.rolls.map(callbackfn);
    }

    reduce(callbackfn, initialValue)
    {
        return this.rolls.reduce(callbackfn, initialValue);
    }
}


module.exports = DicePool;
