import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { AddAndSubtractMathParser } from '../../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRollSubcommand } from '../../options/roll.js';

@staticImplements<ChatIteractionStrategy>()
export class RollSkillStrategy
{
    private static mathParser = new AddAndSubtractMathParser();
    public static key: PtuRollSubcommand.Skill = PtuRollSubcommand.Skill;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('number_of_dice', true);
        const modifierFormula = interaction.options.getString('modifier') ?? '0';
        const name = interaction.options.getString('name');

        // Get result
        const numberOfDice = this.mathParser.evaluate(dicePoolExpression);

        if (numberOfDice === undefined)
        {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply({
                content: `An invalid number of dice was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`,
            });
            return true;
        }

        // Calculate the accuracy modifier
        const modifier = this.mathParser.evaluate(modifierFormula);

        if (modifier === undefined)
        {
            await interaction.editReply(
                'An invalid modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).',
            );
            return true;
        }

        // Make accuracy roll
        const rolls = new DiceLiteService({
            count: numberOfDice,
            sides: 6,
        }).roll();
        const roll = rolls.reduce((acc, cur) =>
            (acc + cur), 0,
        );

        // Calculate the result
        const result = roll + modifier;

        // Create message text
        const resultFormula = this.getFinalResultModifierFormulaForResponse(
            roll,
            modifier,
        );
        const resultFormulaForDisplay = (result.toString() === resultFormula)
            ? ''
            : ` (${resultFormula})`;

        // Send message
        await this.sendMessage({
            interaction,
            message: `${Text.Ping.user(rerollCallbackOptions.newCallingUserId ?? interaction.user.id)} :game_die:\n`
                + `${Text.bold('Roll')}: ${numberOfDice}d6 (${rolls.join(', ')})\n`
                + `${Text.bold(name ?? 'Result')}: ${result}${resultFormulaForDisplay}`,
            rerollCallbackOptions,
        });

        return true;
    }

    private static async sendMessage({
        interaction,
        message,
        rerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    }: {
        interaction: ChatInputCommandInteraction;
        message: string;
        rerollCallbackOptions?: OnRerollCallbackOptions;
    }): Promise<void>
    {
        await RerollStrategy.run({
            interaction,
            options: message,
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });
    }

    private static getFinalResultModifierFormulaForResponse(roll: number, modifier: number): string
    {
        const modifierSign = this.getDisplaySign(modifier);
        const displayModifier = this.getDisplayModifier(modifier);
        const modifierDisplay = [modifierSign, displayModifier].join(' ');

        return `${roll} ${modifierDisplay.trim() !== '' ? `${modifierDisplay}` : ''}`.trim();
    }

    private static getDisplaySign(modifier: number): string
    {
        if (modifier === 0)
        {
            return '';
        }

        if (modifier >= 0)
        {
            return '+';
        }

        return '-';
    }

    private static getDisplayModifier(modifier: number): string
    {
        if (modifier === 0)
        {
            return '';
        }

        if (modifier >= 0)
        {
            return modifier.toString();
        }

        return (modifier * -1).toString();
    }
}
