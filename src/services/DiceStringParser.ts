import { DiceLiteService } from './DiceLiteService.js';
import { RollOptions } from './DiceService.js';

export enum DiceParserType
{
    Die = 'DIE',
    MathOperator = 'MATH_OPERATOR',
    Modifier = 'MODIFIER',
}

export interface ParsedDie
{
    numberOfDice: number;
    sides: number;
    type: DiceParserType.Die;
}

enum Operator
{
    '+' = 'ADD',
    '-' = 'SUBTRACT',
}

export interface MathOperator
{
    operator: keyof typeof Operator;
    name: Operator;
    type: DiceParserType.MathOperator;
}

export interface ParsedModifier
{
    modifier: number;
    type: DiceParserType.Modifier;
}

export interface ParseOptions extends RollOptions
{
    doubleFirstDie?: boolean;
    doubleFirstModifier?: boolean;
}

export type ParsedDicePoolArray = (ParsedDie | MathOperator | ParsedModifier)[];
export type ProcessedDicePoolArray = ((ParsedDie & {
    die: string;
    result: number[];
    total: number;
}) | MathOperator | ParsedModifier)[];

interface RollParsedDicePoolResponse
{
    processedDicePool: ProcessedDicePoolArray;
    unparsedMathString: string;
    resultString: string;
    hasRolledMaxOnFirstDicePool: boolean;
}

export class DiceStringParser
{
    private static letterDRegex = /[d]/i;
    private static supportedMathOperatorRegex = /[+-]/g;

    private static isInvalidDicepoolString(input: string): boolean
    {
        // Allow digits (numbers), "d", "+", and "-"
        return !!input.match(/[^\dd+-]/ig);
    }

    private static parseDie(dieString: string): ParsedDie | ParsedModifier
    {
        const [
            unparsedNumberOfDice,
            sides,
        ] = dieString.split(this.letterDRegex);

        const numberOfDice = unparsedNumberOfDice || '1';

        if (numberOfDice && sides)
        {
            return {
                numberOfDice: parseInt(numberOfDice, 10),
                sides: parseInt(sides, 10),
                type: DiceParserType.Die,
            };
        }

        return {
            modifier: parseInt(numberOfDice, 10),
            type: DiceParserType.Modifier,
        };
    }

    private static parseMathOperators(allDiceString: string): MathOperator[]
    {
        const unparsedResults = allDiceString.matchAll(this.supportedMathOperatorRegex);
        const parsedResults = [...unparsedResults];
        const operators = parsedResults.map<MathOperator>(([operatorString]) =>
        {
            const operator = operatorString as keyof typeof Operator;

            return {
                operator,
                name: Operator[operator],
                type: DiceParserType.MathOperator,
            };
        });
        return operators;
    }

    private static parse(initialAllDiceString: string, parseOptions: ParseOptions = {}): ParsedDicePoolArray | undefined
    {
        const allDiceString = initialAllDiceString.replace(/\s+/g, '');

        // Check if invalid parameters were passed in (return undefined for control flow over throwing an error)
        if (this.isInvalidDicepoolString(allDiceString))
        {
            return undefined;
        }

        const diceList = allDiceString.split(this.supportedMathOperatorRegex);
        const diceInfo = diceList.map(curDieString => this.parseDie(curDieString));

        const mathOperators = this.parseMathOperators(allDiceString);

        const { output } = diceInfo.reduce<{
            output: ParsedDicePoolArray;
            hasDoubledFirstDie: boolean;
            hasDoubledFirstModifier: boolean;
        }>((acc, curDieInfo, index) =>
        {
            const duplicateOfCurDiceInfo = {
                ...curDieInfo,
            };

            // Double the first die if settings permit
            if (
                curDieInfo.type === DiceParserType.Die
                && parseOptions.doubleFirstDie
                && !acc.hasDoubledFirstDie)
            {
                (duplicateOfCurDiceInfo as ParsedDie).numberOfDice *= 2;
                acc.hasDoubledFirstDie = true;
            }

            // Double the first modifier if settings permit
            else if (
                curDieInfo.type === DiceParserType.Modifier
                && parseOptions.doubleFirstModifier
                && !acc.hasDoubledFirstModifier)
            {
                (duplicateOfCurDiceInfo as ParsedModifier).modifier *= 2;
                acc.hasDoubledFirstModifier = true;
            }

            acc.output.push(curDieInfo);

            if (mathOperators[index])
            {
                acc.output.push(mathOperators[index]);
            }

            return acc;
        }, {
            output: [],
            hasDoubledFirstDie: false,
            hasDoubledFirstModifier: false,
        });

        return output;
    }

    private static rollParsedPool(parsedDicePool: ParsedDicePoolArray, options?: RollOptions): RollParsedDicePoolResponse
    {
        // Roll each dice and parse results to string for math parser.
        const result = parsedDicePool.reduce<{
            processedDicePool: ProcessedDicePoolArray;
            unparsedMathString: string;
            resultString: string;
            hasRolledMaxOnFirstDicePool: boolean;
        }>((acc, cur) =>
        {
            if (cur.type === DiceParserType.Die)
            {
                const { numberOfDice, sides } = cur;
                const dieString = `${numberOfDice}d${sides}`;

                const rollOptions: RollOptions = {};
                if (options?.shouldRollMaxOnSecondHalfOfDicepool && !acc.hasRolledMaxOnFirstDicePool)
                {
                    rollOptions.shouldRollMaxOnSecondHalfOfDicepool = true;
                    acc.hasRolledMaxOnFirstDicePool = true;
                }

                const rollResult = new DiceLiteService({
                    count: numberOfDice,
                    sides,
                }).roll(rollOptions);
                const rollTotal = rollResult.reduce((acc2, cur2) => (acc2 + cur2), 0);
                const rollResultsAsString = rollResult.join(', ');

                acc.processedDicePool.push({
                    ...cur,
                    die: dieString,
                    result: rollResult,
                    total: rollTotal,
                });
                acc.unparsedMathString += rollTotal;
                acc.resultString += ` ${dieString} (${rollResultsAsString})`;
            }

            else if (cur.type === DiceParserType.MathOperator)
            {
                acc.processedDicePool.push(cur);
                acc.unparsedMathString += cur.operator;
                acc.resultString += ` ${cur.operator}`;
            }

            else if (cur.type === DiceParserType.Modifier)
            {
                acc.processedDicePool.push(cur);
                acc.unparsedMathString += cur.modifier;
                acc.resultString += ` ${cur.modifier}`;
            }

            return acc;
        }, {
            processedDicePool: [],
            unparsedMathString: '',
            resultString: '',
            hasRolledMaxOnFirstDicePool: false,
        });

        return result;
    }

    public static parseAndRoll(initialAllDiceString: string, options?: ParseOptions): RollParsedDicePoolResponse | undefined
    {
        const parsedDicePool = this.parse(initialAllDiceString, options);

        if (!parsedDicePool)
        {
            return undefined;
        }

        return this.rollParsedPool(parsedDicePool, options);
    }
}
