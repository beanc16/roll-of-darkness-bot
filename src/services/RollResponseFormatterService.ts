import { Text } from '@beanc16/discordjs-helpers';

import { DicePoolGroup } from '../models/DicePoolGroup.js';
import { ResponseFormatterService } from './ResponseFormatterService.js';
import rollConstants from '../constants/roll.js';

export default class RollResponseFormatterService extends ResponseFormatterService
{
    private dicePoolGroup: DicePoolGroup;
    private diceToReroll: number;
    private exceptionalOn: number;
    private extraSuccesses: number;
    private isAdvancedAction: boolean;
    private isRote: boolean;
    private name: string;
    private numberOfDice: number;
    private rerollsDisplay: string;

    constructor({
        authorId = '',
        dicePoolGroup = new DicePoolGroup(),
        diceToReroll = rollConstants.defaultParams.diceToReroll,
        exceptionalOn = rollConstants.defaultParams.exceptionalOn,
        extraSuccesses = 0,
        isAdvancedAction = rollConstants.defaultParams.isAdvancedAction,
        isRote = rollConstants.defaultParams.isRote,
        name = '',
        numberOfDice = rollConstants.defaultParams.count,
        rerollsDisplay = '',
    }: {
        authorId?: string;
        dicePoolGroup?: DicePoolGroup;
        diceToReroll?: number | null;
        exceptionalOn?: number | null;
        extraSuccesses?: number | null;
        flavorText?: string;
        isAdvancedAction?: boolean | null;
        isRote?: boolean | null;
        name?: string | null;
        numberOfDice?: number | null;
        rerollsDisplay?: string;
    } = {})
    {
        super({
            authorId,
        });
        this.dicePoolGroup = dicePoolGroup || new DicePoolGroup();
        this.diceToReroll = diceToReroll || rollConstants.defaultParams.diceToReroll;
        this.exceptionalOn = exceptionalOn || rollConstants.defaultParams.exceptionalOn;
        this.extraSuccesses = extraSuccesses || 0;
        this.isAdvancedAction = isAdvancedAction || rollConstants.defaultParams.isAdvancedAction;
        this.isRote = isRote || rollConstants.defaultParams.isRote;
        this.name = name as string;
        this.numberOfDice = numberOfDice || rollConstants.defaultParams.count;
        this.rerollsDisplay = rerollsDisplay;
    }

    getDiceString(dicepoolIndex: number)
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

    getWithParametersString(dicepoolIndex: number)
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

        if (this.exceptionalOn && this.exceptionalOn !== rollConstants.defaultParams.exceptionalOn)
        {
            results.push(`exceptional success occurring on ${this.exceptionalOn} ${this.getSuccessesAsSingularOrPlural(dicepoolIndex, {
                numToTestInstead: this.exceptionalOn,
            })}`);
        }

        if (this.diceToReroll && this.diceToReroll !== rollConstants.defaultParams.diceToReroll) {
            results.push(`rerolling ${this.diceToReroll} dice on reroll`);
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

    getSuccessesAsSingularOrPlural(dicepoolIndex: number, {
        numToTestInstead,
    }: {
        numToTestInstead?: number;
    } = {})
    {
        if (!numToTestInstead && this.dicePoolGroup.getNumOfSuccessesOfDicepoolAt(dicepoolIndex) !== 1)
        {
            return 'successes';
        }

        else if (numToTestInstead && numToTestInstead !== 1)
        {
            return 'successes';
        }

        return 'success';
    }

    getDicepoolResponse(dicepoolIndex: number)
    {
        const totalNumOfSuccesses = this.dicePoolGroup.getNumOfSuccessesOfDicepoolAt(dicepoolIndex);
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

        const rollName = (this.name) ? ` for ${this.name}` : '';

        return `${this.authorPing} rolled ${this.numberOfDice} dice${this.getWithParametersString(0)}${rollName}.`
            + responsesStr;
    }
}
