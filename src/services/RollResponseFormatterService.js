const { Text } = require('@beanc16/discordjs-helpers');
const rollConstants = require('../constants/roll');

class RollResponseFormatterService
{
    constructor({
        authorId,
        numberOfDice = rollConstants.defaultParams.count,
        results = [],
    } = {})
    {
        this.authorId = authorId;
        this.numberOfDice = numberOfDice || rollConstants.defaultParams.count;
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

        const successDice = this.results.flat().filter((result) => result >= 8);
        this._numOfSuccesses = successDice.length;

        return this._numOfSuccesses;
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

            acc += `${result[0]}`;

            // Add parenthesis around dice that were re-rolled
            for (let i = 1; i < result.length; i++)
            {
                acc += ` (${result[i]})`;
            }

            return acc;
        }, '');

        return this._diceString;
    }

    getResponse()
    {
        const successesSingularOrPlural = (this.numOfSuccesses !== 1)
            ? 'successes'
            : 'success';
        
        const successesText = Text.bold(`${this.numOfSuccesses} ${successesSingularOrPlural}`);

        return `${this.authorPing} rolled ${this.numberOfDice} dice and got ${successesText}. ${this.diceString}`;
    }
}



module.exports = RollResponseFormatterService;
