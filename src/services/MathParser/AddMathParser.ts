import { addMathParserOptions } from './constants.js';
import { MathParser } from './MathParser.js';

export class AddMathParser extends MathParser
{
    constructor()
    {
        super(addMathParserOptions);
    }
}
