import { addAndSubtractMathParserOptions } from './constants.js';
import { MathParser } from './MathParser.js';

export class AddAndSubtractMathParser extends MathParser
{
    constructor()
    {
        super(addAndSubtractMathParserOptions);
    }
}