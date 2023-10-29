const BaseRollCommand = require('./base-commands/BaseRollCommand');
const options = require('./options');
const { mathParserOptions } = require('../constants/mathParserOptions');
const { maxParams } = require('../constants/roll');
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
        });

        this._mathParser = new Parser(mathParserOptions);
    }

    async run(interaction)
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('dice_pool');
        const isSecret = interaction.options.getBoolean('secret') || false;

        // Get result
        let successfullyParsedDicepool = true;
        let numberOfDice = 0;

        try {
            numberOfDice = this._mathParser.evaluate(dicePoolExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            successfullyParsedDicepool = false;
            await interaction.reply({
                content: `An invalid dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`,
                ephemeral: isSecret,
            });
        }

        // Run this separately from the try catch, so errors in super.run don't send an incorrect error message
        if (successfullyParsedDicepool) {
            // Haven't exceeded the max number of dice to roll
            if (numberOfDice <= maxParams.numberOfDice && numberOfDice > 0)
            {
                await super.run(interaction, {
                    numberOfDice,
                });
            }
            else
            {
                await interaction.reply({
                    content: `The calculated number of dice to roll is ${numberOfDice}, but it must be a number between 1 and ${maxParams.numberOfDice}.`,
                    ephemeral: isSecret,
                });
            }
        }
    }

    get description()
    {
        return `Roll a dice pool of d10s.`;
    }
}



module.exports = new Roll_Math();
