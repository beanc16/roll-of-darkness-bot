import { ChatInputCommandInteraction } from 'discord.js';
import { Parser } from 'expr-eval';

import { ChatIteractionStrategy } from '../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { NwodSubcommand } from '../options/index.js';
import { BaseRollStrategy } from './BaseRollStrategy.js';
import rollConstants from '../../../constants/roll.js';
import { addAndSubtractMathParserOptions } from '../../../constants/mathParserOptions.js';

@staticImplements<ChatIteractionStrategy>()
export class RollStrategy
{
    public static key = NwodSubcommand.Roll;
    private static mathParser = new Parser(addAndSubtractMathParserOptions);

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('number_of_dice', true);
        const isSecret = interaction.options.getBoolean('secret') || false;

        // Get result
        let numberOfDice = 0;

        try {
            numberOfDice = this.mathParser.evaluate(dicePoolExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.reply({
                content: `An invalid dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`,
                ephemeral: isSecret,
            });
            return true;
        }

        // Haven't exceeded the max number of dice to roll
        if (numberOfDice <= rollConstants.maxParams.numberOfDice && numberOfDice > 0)
        {
            return await BaseRollStrategy.run({
                interaction,
                numberOfDice,
            });
        }
        else
        {
            await interaction.reply({
                content: `The calculated number of dice to roll is ${numberOfDice}, but it must be a number between 1 and ${rollConstants.maxParams.numberOfDice}.`,
                ephemeral: isSecret,
            });
            return true;
        }
    }
}
