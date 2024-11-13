import {
    Expression,
    Parser,
    ParserOptions,
    Value,
} from 'expr-eval';

class MathParser
{
    private parser: Parser;

    constructor(options: ParserOptions)
    {
        this.parser = new Parser(options);
    }

    public parse(expression: string): Expression | undefined
    {
        try
        {
            return this.parser.parse(expression);
        }

        catch (error)
        {
            /*
             * Fail silently. This can occur if users input an invalid
             * mathematical expression. We don't want to throw errors
             * from user-driven behavior.
             */

            return undefined;
        }
    }

    public evaluate(expression: string, values?: Value): number | undefined
    {
        try
        {
            return this.parser.evaluate(expression, values);
        }

        catch (error)
        {
            /*
             * Fail silently. This can occur if users input an invalid
             * mathematical expression. We don't want to throw errors
             * from user-driven behavior.
             */

            return undefined;
        }
    }
}

const addMathParserOptions: ParserOptions = {
    operators: {
        // Only allow addition
        add: true,

        // Make everything else false
        subtract: false,
        comparison: false,
        concatenate: false,
        conditional: false,
        divide: false,
        factorial: false,
        logical: false,
        multiply: false,
        power: false,
        remainder: false,
        sin: false,
        cos: false,
        tan: false,
        asin: false,
        acos: false,
        atan: false,
        sinh: false,
        cosh: false,
        tanh: false,
        asinh: false,
        acosh: false,
        atanh: false,
        sqrt: false,
        log: false,
        ln: false,
        lg: false,
        log10: false,
        abs: false,
        ceil: false,
        floor: false,
        round: false,
        trunc: false,
        exp: false,
        length: false,
        in: false,
        random: false,
        min: false,
        max: false,
        assignment: false,
        fndef: false,
        cbrt: false,
        expm1: false,
        log1p: false,
        sign: false,
        log2: false,
    },
};

const addAndSubtractMathParserOptions: ParserOptions = {
    operators: {
        // Only allow addition and subtraction
        ...addMathParserOptions.operators,
        subtract: true,
    },
};

export class AddMathParser extends MathParser
{
    constructor()
    {
        super(addMathParserOptions);
    }
}

export class AddAndSubractMathParser extends MathParser
{
    constructor()
    {
        super(addAndSubtractMathParserOptions);
    }
}
