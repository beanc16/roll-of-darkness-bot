const { Text } = require('@beanc16/discordjs-helpers');
const rollConstants = require('../constants/roll');
const DicePoolGroup = require('../models/DicePoolGroup');

class RollResponseFormatterService
{
    constructor({
        authorId,
        dicePoolGroup = new DicePoolGroup(),
        exceptionalOn = rollConstants.defaultParams.exceptionalOn,
        extraSuccesses = 0,
        flavorText = rollConstants.defaultFlavorTextResults,
        isAdvancedAction = rollConstants.defaultParams.isAdvancedAction,
        isRote = rollConstants.defaultParams.isRote,
        numberOfDice = rollConstants.defaultParams.count,
        rerollsDisplay,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
    } = {})
    {
        this.authorId = authorId;
        this.dicePoolGroup = dicePoolGroup || new DicePoolGroup();
        this.exceptionalOn = exceptionalOn || rollConstants.defaultParams.exceptionalOn;
        this.extraSuccesses = extraSuccesses || 0;
        this.flavorText = flavorText || rollConstants.defaultFlavorTextResults;
        this.isAdvancedAction = isAdvancedAction || rollConstants.defaultParams.isAdvancedAction;
        this.isRote = isRote || rollConstants.defaultParams.isRote;
        this.numberOfDice = numberOfDice || rollConstants.defaultParams.count;
        this.rerollsDisplay = rerollsDisplay;
        this.successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo || rollConstants.default.successOnGreaterThanOrEqualTo;
    }

    get authorPing()
    {
        return Text.Ping.user(this.authorId);
    }

    getNumOfSuccessesWithExtraSuccesses(dicepoolIndex)
    {
        return this.dicePoolGroup.getNumOfSuccessesOfDicepoolAt(dicepoolIndex) + this.extraSuccesses;
    }

    getDiceString(dicepoolIndex)
    {
        const diceString = this.dicePoolGroup.get(dicepoolIndex).reduce(function (acc, result)
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

        return diceString;
    }

    getWithParametersString(dicepoolIndex)
    {
        const results = [];

        if (this.rerollsDisplay && this.rerollsDisplay !== rollConstants.rerollsEnum.ten_again.display)
        {
            results.push(this.rerollsDisplay);
        }

        if (this.isAdvancedAction)
        {
            results.push('advanced action');
        }

        if (this.isRote)
        {
            results.push('rote');
        }

        if (this.exceptionalOn && this.exceptionalOn !== 5)
        {
            results.push(`exceptional success occurring on ${this.exceptionalOn} ${this.getSuccessesAsSingularOrPlural(dicepoolIndex, {
                numToTestInstead: this.exceptionalOn,
            })}`);
        }

        if (this.extraSuccesses)
        {
            results.push(`${this.extraSuccesses} extra ${this.getSuccessesAsSingularOrPlural(dicepoolIndex, { 
                numToTestInstead: this.extraSuccesses,
            })}`);
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

    getSuccessesAsSingularOrPlural(dicepoolIndex, {
        numToTestInstead,
    } = {})
    {
        if (!numToTestInstead && this.getNumOfSuccessesWithExtraSuccesses(dicepoolIndex) !== 1)
        {
            return 'successes';
        }

        else if (numToTestInstead && numToTestInstead !== 1)
        {
            return 'successes';
        }

        return 'success';
    }

    getDicepoolResponse(dicepoolIndex)
    {
        const totalNumOfSuccesses = this.getNumOfSuccessesWithExtraSuccesses(dicepoolIndex);
        const successesSingularOrPlural = this.getSuccessesAsSingularOrPlural(dicepoolIndex)
        const successesText = Text.bold(`${totalNumOfSuccesses} ${successesSingularOrPlural}`);

        return {
            totalNumOfSuccesses,
            response: `\n\n${successesText}\n${this.getDiceString(dicepoolIndex)}`,
        };
    }

    getResponse()
    {
        const highestDicepool = {
            index: -1,
            totalNumOfSuccesses: -1,
        };
        const responseObjs = this.dicePoolGroup.map((_, index) =>
        {
            const response = this.getDicepoolResponse(index);

            if (response.totalNumOfSuccesses > highestDicepool.totalNumOfSuccesses)
            {
                highestDicepool.totalNumOfSuccesses = response.totalNumOfSuccesses;
                highestDicepool.index = index;
            }

            return response;
        });

        const responsesStr = responseObjs.reduce(function (acc, responseObj, index)
        {
            if (highestDicepool.index === index)
            {
                acc += responseObj.response;
            }

            else
            {
                acc += `~~${responseObj.response}~~`;
                //acc += Text.StrikeThrough(responseObj.response);
            }

            return acc;
        }, '');

        return `${this.authorPing} rolled ${this.numberOfDice} dice${this.getWithParametersString(0)}. ${this.flavorText}`
            + responsesStr;
    }
}



module.exports = RollResponseFormatterService;
