import {
    Parser,
    ParserOptions,
    Value,
} from 'expr-eval';

export class MathParser
{
    private parser: Parser;

    constructor(options: ParserOptions)
    {
        this.parser = new Parser(options);
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
