const BaseRollCommand = require('./base-commands/BaseRollCommand');
const options = require('./options');
const { Parser } = require('expr-eval');

class Roll_Math extends BaseRollCommand
{
    constructor()
    {
        super({
            firstParameter: {
                type: 'string',
                value: options.rollMath.dicePool,
            },
        });Parser

        this._mathParser = new Parser({
            operators: {
                // Only allow addition and subtraction
                add: true,
                subtract: true,

                // Make everything else false
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
                log2: false
            },
        });
    }

    async run(interaction)
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('dice_pool');

        // Get result
        let successfullyParsedDicepool = true;
        let numberOfDice = 0;

        try {
            numberOfDice = this._mathParser.evaluate(dicePoolExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            successfullyParsedDicepool = false;
            interaction.reply(`An invalid dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
        }

        // Run this separately from the try catch, so errors in super.run don't send an incorrect error message
        if (successfullyParsedDicepool) {
            super.run(interaction, {
                numberOfDice,
            });
        }
    }
}



module.exports = new Roll_Math();
