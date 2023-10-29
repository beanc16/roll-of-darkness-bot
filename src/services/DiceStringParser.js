const diceParserTypes = {
    Die: 'DIE',
    MathOperator: 'MATH_OPERATOR',
    Modifier: 'MODIFIER',
};

class DiceStringParser {
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
            numberOfDice,
            sides,
        ] = dieString.split(this.#letterDRegex) || [];

        if (numberOfDice && sides)
        {
            return {
                numberOfDice,
                sides,
                type: diceParserTypes.Die,
            };
        }
        else
        {
            return {
                modifier: numberOfDice,
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

        return output;
    }
}



module.exports = {
    diceParserTypes,
    DiceStringParser,
};
