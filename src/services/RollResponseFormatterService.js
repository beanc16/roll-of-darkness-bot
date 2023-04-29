const { Text } = require('@beanc16/discordjs-helpers');
const rollConstants = require('../constants/roll');

class RollResponseFormatterService
{
    constructor({
        authorId,
        exceptionalOn = 5,
        extraSuccesses = 0,
        isRote = rollConstants.defaultParams.isRote,
        numberOfDice = rollConstants.defaultParams.count,
        rerollsDisplay,
        results = [],
    } = {})
    {
        this.authorId = authorId;
        this.exceptionalOn = exceptionalOn || 5;
        this.extraSuccesses = extraSuccesses || 0;
        this.isRote = isRote || rollConstants.defaultParams.isRote;
        this.numberOfDice = numberOfDice || rollConstants.defaultParams.count;
        this.rerollsDisplay = rerollsDisplay;
        this.results = results || [];
    }

    get authorPing()
    {
        return Text.Ping.user(this.authorId);
    }

    get numOfSuccesses()
    {
        if (this._numOfSuccesses)
        {
            return this._numOfSuccesses;
        }

        const successDice = this.results.flat().filter((result) => result.number >= 8);
        this._numOfSuccesses = successDice.length;

        return this._numOfSuccesses;
    }

    get numOfSuccessesWithExtraSuccesses()
    {
        return this.numOfSuccesses + this.extraSuccesses;
    }

    get diceString()
    {
        if (this._diceString)
        {
            return this._diceString;
        }

        this._diceString = this.results.reduce(function (acc, result)
        {
            // Add commas to the end of the previous success (except for the first roll)
            if (acc !== '')
            {
                acc += ', ';
            }

            acc += `${result[0].number}`;

            // Add parenthesis around dice that were re-rolled
            for (let i = 1; i < result.length; i++)
            {
                // Format as rote
                if (result[i].isRote)
                {
                    acc += ` R:${result[i].number}`;
                }

                // Format as reroll
                else
                {
                    acc += ` (${result[i].number})`;
                }
            }

            return acc;
        }, '');

        return this._diceString;
    }

    get withParametersString()
    {
        const results = [];

        if (this.rerollsDisplay)
        {
            results.push(this.rerollsDisplay);
        }

        if (this.isRote)
        {
            results.push('rote');
        }

        if (this.exceptionalOn && this.exceptionalOn !== 5)
        {
            results.push(`exceptional success occurring on ${this.exceptionalOn} ${this.getSuccessesAsSingularOrPlural(this.exceptionalOn)}`);
        }

        if (this.extraSuccesses)
        {
            results.push(`${this.extraSuccesses} extra successes`);
        }

        if (results.length === 0)
        {
            return '';
        }

        return results.reduce(function (acc, result, index)
        {
            // Add commas between results (after the first result) if there's 3 or more results
            if (index !== 0 && results.length >= 3)
            {
                acc += ',';
            }

            // Add "and" between results on the last result if there's 2 or more results
            if (index === results.length - 1 && results.length >= 2)
            {
                acc += ' and';
            }

            acc += ` ${result}`;

            return acc;
        }, ' with');
    }

    getSuccessesAsSingularOrPlural()
    {
        if (this.numOfSuccessesWithExtraSuccesses !== 1)
        {
            return 'successes';
        }

        return 'success';
    }

    getResponse()
    {
        const successesSingularOrPlural = this.getSuccessesAsSingularOrPlural(this.numOfSuccessesWithExtraSuccesses)

        const successesText = Text.bold(`${this.numOfSuccessesWithExtraSuccesses} ${successesSingularOrPlural}`);

        return `${this.authorPing} rolled ${this.numberOfDice} dice${this.withParametersString}.`
            + `\n\n${successesText}\n${this.diceString}`;
    }
}



module.exports = RollResponseFormatterService;
