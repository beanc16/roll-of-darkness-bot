import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { NwodSubcommand } from '../options/index.js';
import rollConstants from '../../../constants/roll.js';
import { DiceService } from '../../../services/DiceService.js';
import { InitiativeResponseFormatterService } from '../../../services/InitiativeResponseFormatterService.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../types/discord.js';
import { AddAndSubractMathParser } from '../../../services/MathParser.js';

@staticImplements<ChatIteractionStrategy>()
export class InitiativeStrategy
{
    public static key = NwodSubcommand.Initiative;
    private static mathParser = new AddAndSubractMathParser();

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
            onRerollCallback: (newRerollCallbackOptions) => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: 'nwod initiative',
        });
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
