import { DiceLiteService } from './DiceLiteService.js';

export interface ParsedDie
{
    numberOfDice: number;
    sides: number;
    type: string;
}

export interface MathOperator
{
    operator: any;
    name: any;
    type: string;
}

export interface ParsedModifier
{
    modifier: number;
    type: string;
}

export const diceParserTypes = {
    Die: 'DIE',
    MathOperator: 'MATH_OPERATOR',
    Modifier: 'MODIFIER',
};

export type ParsedDicePool = (ParsedDie | MathOperator | ParsedModifier)[];
export type ProcessedDicePool = ((ParsedDie & {
    die: string;
    result: number[];
    total: number;
}) | MathOperator | ParsedModifier)[];

export class DiceStringParser
{
    // private static digitRegex = /\d/;
    private static letterDRegex = /[d]/i;
    private static supportedMathOperatorRegex = /[+-]/g;
    private static mathOperatorMap = {
        '+': 'ADD',
        '-': 'SUBTRACT',
    };

    static #parseDie(dieString: string): ParsedDie | ParsedModifier
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
                type: diceParserTypes.Die,
            };
        }
        else
        {
            return {
                modifier: parseInt(numberOfDice, 10),
                type: diceParserTypes.Modifier,
            };
        }
    }

    static #parseMathOperators(allDiceString: string)
    {
        const unparsedResults = allDiceString.matchAll(this.supportedMathOperatorRegex);
        const parsedResults = [...unparsedResults];
        const operators = parsedResults.map(([operatorString]) =>
        {
            return {
                operator: operatorString,
                name: this.mathOperatorMap[
                    operatorString as keyof typeof this.mathOperatorMap
                ],
                type: diceParserTypes.MathOperator,
            }
        });
        return operators;
    }

    private static parse(initialAllDiceString: string): ParsedDicePool
    {
        const allDiceString = initialAllDiceString.replace(/\s+/g, '');

        const diceList = allDiceString.split(this.supportedMathOperatorRegex);
        const diceInfo = diceList.map((curDieString) => this.#parseDie(curDieString));

        const mathOperators = this.#parseMathOperators(allDiceString);

        const output = diceInfo.reduce<ParsedDicePool>((acc, curDieInfo, index) =>
        {
            acc.push(curDieInfo);

            if (mathOperators[index])
            {
                acc.push(mathOperators[index]);
            }

            return acc;
        }, []);

        return output;
    }

    private static rollParsedPool(parsedDicePool: ParsedDicePool)
    {
        // Roll each dice and parse results to string for math parser.
        const result = parsedDicePool.reduce<{
            processedDicePool: ProcessedDicePool;
            unparsedMathString: string;
            resultString: string;
        }>((acc, cur) =>
        {
            if (cur.type === diceParserTypes.Die)
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

            else if (cur.type === diceParserTypes.MathOperator)
            {
                const curMathOperator = cur as MathOperator;
                acc.processedDicePool.push(curMathOperator);
                acc.unparsedMathString += curMathOperator.operator;
                acc.resultString += ` ${curMathOperator.operator}`;
            }

            else if (cur.type === diceParserTypes.Modifier)
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

    public static parseAndRoll(initialAllDiceString: string)
    {
        const parsedDicePool = this.parse(initialAllDiceString);
        return this.rollParsedPool(parsedDicePool);
    }
}
