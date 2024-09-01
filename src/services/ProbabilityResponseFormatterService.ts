import { ResponseFormatterService } from './ResponseFormatterService.js';
import rollConstants from '../constants/roll.js';

export default class ProbabilityResponseFormatterService extends ResponseFormatterService
{
    private desiredNumberOfSuccesses: number;
    private numberOfDice: number;
    private rerolls: string;
    private rote: boolean | null;
    private advancedAction: boolean | null;
    private probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice: string;

    constructor({
        authorId,
        desiredNumberOfSuccesses,
        numberOfDice,
        rerolls = '10again',
        rote = false,
        advancedAction = false,
        probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
        roundToDecimalPlaces = 1,
    }: {
        authorId: string;
        desiredNumberOfSuccesses: number;
        numberOfDice: number;
        rerolls: string;
        rote: boolean | null;
        advancedAction: boolean| null;
        probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice: number;
        roundToDecimalPlaces?: number;
    })
    {
        super({
            authorId,
        });
        this.desiredNumberOfSuccesses = desiredNumberOfSuccesses;
        this.numberOfDice = numberOfDice;
        this.rerolls = rerolls;
        this.rote = rote;
        this.advancedAction = advancedAction;
        this.probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice = probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice.toFixed(roundToDecimalPlaces);
    }

    getWithParametersString()
    {
        const results = [];

        if (this.numberOfDice !== undefined)
        {
            results.push(`${this.numberOfDice} dice`);
        }

        if (this.rerolls && this.rerolls !== rollConstants.rerollsEnum.ten_again.display)
        {
            results.push(this.rerolls);
        }

        if (this.advancedAction)
        {
            results.push('advanced action');
        }

        if (this.rote)
        {
            results.push('rote');
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

    getResponse()
    {
        return `${this.authorPing}, you have a ${this.probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice}% chance of getting ${this.desiredNumberOfSuccesses} ${this.getSuccessesAsSingularOrPlural(this.desiredNumberOfSuccesses)}${this.getWithParametersString()}.`;
    }
}
