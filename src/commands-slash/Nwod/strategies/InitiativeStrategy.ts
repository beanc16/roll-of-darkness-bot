import { ChatInputCommandInteraction } from 'discord.js';

import rollConstants from '../../../constants/roll.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { DicePoolGroup } from '../../../services/DicePoolGroup.js';
import { DiceService } from '../../../services/DiceService.js';
import { InitiativeResponseFormatterService } from '../../../services/InitiativeResponseFormatterService.js';
import { AddAndSubtractMathParser } from '../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { NwodSubcommand } from '../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class InitiativeStrategy
{
    public static key: NwodSubcommand.Initiative = NwodSubcommand.Initiative;
    private static mathParser = new AddAndSubtractMathParser();

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get initial parameter result
        const initiativeModifierExpression = interaction.options.getString('initiative_modifier', true);
        const name = interaction.options.getString('name');

        // Get result
        const initiativeModifier = this.mathParser.evaluate(initiativeModifierExpression);

        if (initiativeModifier === undefined)
        {
            await interaction.editReply(`An invalid initiative modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
            return true;
        }

        const dicePoolGroup = this.roll();

        // Response
        const initiativeResponseFormatterService = new InitiativeResponseFormatterService({
            authorId: rerollCallbackOptions.newCallingUserId ?? interaction.user.id,
            dicePoolGroup,
            initiativeModifier,
            name,
        });
        await RerollStrategy.run({
            interaction,
            options: initiativeResponseFormatterService.getResponse(),
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: 'nwod initiative',
        });
        return true;
    }

    private static roll(): DicePoolGroup
    {
        // Get parameter results
        const numberOfDice = 1;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            // Don't reroll
            rerollOnGreaterThanOrEqualTo: rollConstants.rerollsEnum.no_again.number,
            successOnGreaterThanOrEqualTo: 10, // You can't succeed at initiative rolls, so just set the number really high
        });
        const dicePoolGroup = diceService.roll();

        return dicePoolGroup;
    }

    public static rollWithModifier(modifier = 0): number
    {
        const dicePoolGroup = this.roll();
        const [result] = dicePoolGroup.getBiggestResult().rollResults;
        return result + modifier;
    }
}
