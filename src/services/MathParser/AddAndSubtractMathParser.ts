import { addAndSubtractMathParserOptions } from './constants.js';
import { MathParser } from './MathParser.js';

export class AddAndSubractMathParser extends MathParser
{
    constructor()
    {
        super(addAndSubtractMathParserOptions);
    }
}