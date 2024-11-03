import { ChatInputCommandInteraction } from 'discord.js';
import { Parser } from 'expr-eval';

import { ChatIteractionStrategy } from '../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { NwodSubcommand } from '../options/index.js';
import rollConstants from '../../../constants/roll.js';
import { DiceService } from '../../../services/DiceService.js';
import { InitiativeResponseFormatterService } from '../../../services/InitiativeResponseFormatterService.js';
import { addAndSubtractMathParserOptions } from '../../../constants/mathParserOptions.js';

@staticImplements<ChatIteractionStrategy>()
export class InitiativeStrategy
{
    public static key = NwodSubcommand.Initiative;
    private static mathParser = new Parser(addAndSubtractMathParserOptions);

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get initial parameter result
        const initiativeModifierExpression = interaction.options.getString('initiative_modifier', true);
        const name = interaction.options.getString('name');

        // Get result
        let initiativeModifier = 0;

        try {
            initiativeModifier = this.mathParser.evaluate(initiativeModifierExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid initiative modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
            return true;
        }

        const dicePoolGroup = this.roll();

        // Response
        const initiativeResponseFormatterService = new InitiativeResponseFormatterService({
            authorId: interaction.user.id,
            dicePoolGroup,
            initiativeModifier,
            name,
        });
        await interaction.editReply(
            initiativeResponseFormatterService.getResponse()
        );
        return true;
    }

    private static roll()
    {
        // Get parameter results
        const numberOfDice = 1;
        const rerollsKey = rollConstants.rerollsEnum.no_again.key as keyof typeof rollConstants.rerollsEnum;

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey].number;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            successOnGreaterThanOrEqualTo: 10, // You can't succeed at initiative rolls, so just set the number really high
            canBeDramaticFailure: false,
        });
        const dicePoolGroup = diceService.roll();

        return dicePoolGroup;
    }

    public static rollWithModifier(modifier = 0)
    {
        const dicePoolGroup = this.roll();
        const [result] = dicePoolGroup.getBiggestResult().rollResults;
        return result + modifier;
    }
}
