import { DiceLiteService } from './DiceLiteService.js';

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

export interface ParseOptions
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

export class DiceStringParser
{
    // private static digitRegex = /\d/;
    private static letterDRegex = /[d]/i;
    private static supportedMathOperatorRegex = /[+-]/g;

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
        else
        {
            return {
                modifier: parseInt(numberOfDice, 10),
                type: DiceParserType.Modifier,
            };
        }
    }

    private static parseMathOperators(allDiceString: string)
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
            }
        });
        return operators;
    }

    private static parse(initialAllDiceString: string, parseOptions: ParseOptions = {}): ParsedDicePoolArray
    {
        const allDiceString = initialAllDiceString.replace(/\s+/g, '');

        const diceList = allDiceString.split(this.supportedMathOperatorRegex);
        const diceInfo = diceList.map((curDieString) => this.parseDie(curDieString));

        const mathOperators = this.parseMathOperators(allDiceString);

        // TODO: Handle DoubleFirstDieAndModifier
        const { output } = diceInfo.reduce<{
            output: ParsedDicePoolArray;
            hasDoubledFirstDie: boolean;
            hasDoubledFirstModifier: boolean;
        }>((acc, curDieInfo, index) =>
        {
            // Double the first die if settings permit
            if (
                curDieInfo.type === DiceParserType.Die
                && parseOptions.doubleFirstDie
                && !acc.hasDoubledFirstDie)
            {
                curDieInfo.numberOfDice *= 2;
                acc.hasDoubledFirstDie = true;
            }

            // Double the first modifier if settings permit
            else if (
                curDieInfo.type === DiceParserType.Modifier
                && parseOptions.doubleFirstModifier
                && !acc.hasDoubledFirstModifier)
            {
                curDieInfo.modifier *= 2;
                acc.hasDoubledFirstDie = true;
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

    private static rollParsedPool(parsedDicePool: ParsedDicePoolArray)
    {
        // Roll each dice and parse results to string for math parser.
        const result = parsedDicePool.reduce<{
            processedDicePool: ProcessedDicePoolArray;
            unparsedMathString: string;
            resultString: string;
        }>((acc, cur) =>
        {
            if (cur.type === DiceParserType.Die)
            {
                const curParsedDie = cur as ParsedDie;
                const { numberOfDice, sides } = curParsedDie;
                const dieString = `${numberOfDice}d${sides}`;
                const rollResult = new DiceLiteService({
                    count: numberOfDice,
                    sides,
                }).roll();
                const rollTotal = rollResult.reduce((acc, cur) => (acc + cur), 0);
                const rollResultsAsString = rollResult.join(', ');

                acc.processedDicePool.push({
                    ...curParsedDie,
                    die: dieString,
                    result: rollResult,
                    total: rollTotal,
                });
                acc.unparsedMathString += rollTotal;
                acc.resultString += ` ${dieString} (${rollResultsAsString})`;
            }

            else if (cur.type === DiceParserType.MathOperator)
            {
                const curMathOperator = cur as MathOperator;
                acc.processedDicePool.push(curMathOperator);
                acc.unparsedMathString += curMathOperator.operator;
                acc.resultString += ` ${curMathOperator.operator}`;
            }

            else if (cur.type === DiceParserType.Modifier)
            {
                const curParsedModifier = cur as ParsedModifier;
                acc.processedDicePool.push(curParsedModifier);
                acc.unparsedMathString += curParsedModifier.modifier;
                acc.resultString += ` ${curParsedModifier.modifier}`;
            }

            return acc;
        }, {
            processedDicePool: [],
            unparsedMathString: '',
            resultString: '',
        });

        return result;
    }

    public static parseAndRoll(initialAllDiceString: string, parseOptionType?: ParseOptions)
    {
        const parsedDicePool = this.parse(initialAllDiceString, parseOptionType);
        return this.rollParsedPool(parsedDicePool);
    }
}
