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

    static parse(initialAllDiceString: string): ParsedDicePool
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
}
