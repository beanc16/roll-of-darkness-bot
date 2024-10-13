import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';
import { Parser } from 'expr-eval';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRollSubcommand } from '../../subcommand-groups/roll.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { addAndSubtractMathParserOptions } from '../../../../constants/mathParserOptions.js';

@staticImplements<ChatIteractionStrategy>()
export class RollCaptureStrategy
{
    private static mathParser = new Parser(addAndSubtractMathParserOptions);
    public static key = PtuRollSubcommand.Capture;
    public static ACCURACY_ROLL_AC = 6;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const trainerLevel = interaction.options.getInteger('trainer_level', true);
        const additionalModifierFormula = interaction.options.getString('additional_modifier') ?? '0';

        // Calculate the additional modifier
        let additionalModifier: number;
        try {
            additionalModifier = this.mathParser.evaluate(additionalModifierFormula);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(
                'An invalid additional modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).'
            );
            return true;
        }

        // Make accuracy roll
        const accuracyRoll = new DiceLiteService({
            count: 1,
            sides: 20,
        })
        .roll()
        .reduce((acc, cur) =>
            (acc + cur), 0
        );

        if (accuracyRoll <= this.ACCURACY_ROLL_AC)
        {
            await interaction.editReply(
                `${Text.Ping.user(interaction.user.id)} :game_die:\n` +
                `${Text.bold('Accuracy')}: ${accuracyRoll}\n` +
                `${Text.bold('Result')}: Failed to hit the Pokémon with the Pokéball`
            );
            return true;
        }

        // Make capture roll
        const captureRoll = new DiceLiteService({
            count: 1,
            sides: 100,
        })
        .roll()
        .reduce((acc, cur) =>
            (acc + cur), 0
        );

        // Calculate the result
        const accuracyModifier = (accuracyRoll === 20)
            ? -10
            : 0;
        const result = captureRoll - trainerLevel + accuracyModifier + additionalModifier;

        // Send message
        if (captureRoll === 1)
        {
            await interaction.editReply(
                `${Text.Ping.user(interaction.user.id)} rolled a guaranteed capture!!!\n` +
                `${Text.bold('Accuracy')}: 1d20 (${accuracyRoll})\n` +
                `${Text.bold('Capture')}: 1d100 (${captureRoll})\n` +
                `${Text.bold('Result')}: ${result}`
            );
        }

        // Send message
        else
        {
            await interaction.editReply(
                `${Text.Ping.user(interaction.user.id)} :game_die:\n` +
                `${Text.bold('Accuracy')}: 1d20 (${accuracyRoll})\n` +
                `${Text.bold('Capture')}: 1d100 (${captureRoll})\n` +
                `${Text.bold('Result')}: ${result}`
            );
        }

        return true;
    }
}