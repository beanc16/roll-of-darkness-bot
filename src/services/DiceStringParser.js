const diceParserTypes = {
    Die: 'DIE',
    MathOperator: 'MATH_OPERATOR',
    Modifier: 'MODIFIER',
};

class DiceStringParser
{
    static #digitRegex = /\d/;
    static #letterDRegex = /[d]/i;
    static #supportedMathOperatorRegex = /[+-]/g;
    static #mathOperatorMap = {
        '+': 'ADD',
        '-': 'SUBTRACT',
    };

    static #parseDie(dieString)
    {
        const [
            unparsedNumberOfDice,
            sides,
        ] = dieString.split(this.#letterDRegex);

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

    static #parseMathOperators(allDiceString)
    {
        const unparsedResults = allDiceString.matchAll(this.#supportedMathOperatorRegex);
        const parsedResults = [...unparsedResults];
        const operators = parsedResults.map(([operatorString]) =>
        {
            return {
                operator: operatorString,
                name: this.#mathOperatorMap[operatorString],
                type: diceParserTypes.MathOperator,
            }
        });
        return operators;
    }

    static parse(initialAllDiceString)
    {
        const allDiceString = initialAllDiceString.replace(/\s+/g, '');

        const diceList = allDiceString.split(this.#supportedMathOperatorRegex);
        const diceInfo = diceList.map((curDieString) => this.#parseDie(curDieString));

        const mathOperators = this.#parseMathOperators(allDiceString);

        const output = diceInfo.reduce((acc, curDieInfo, index) =>
        {
            acc.push(curDieInfo);

            if (mathOperators[index])
            {
                acc.push(mathOperators[index]);
            }

            return acc;
        }, []);

        console.log('\n allDiceString:', allDiceString);
        console.log('\n diceList:', diceList);
        console.log('\n diceInfo:', diceInfo);
        console.log('\n mathOperators:', mathOperators);
        console.log('\n output:', output);

        return output;
    }
}



module.exports = {
    diceParserTypes,
    DiceStringParser,
};
