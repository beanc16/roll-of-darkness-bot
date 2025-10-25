import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/Dice/DiceLiteService.js';
import { AddAndSubtractMathParser } from '../../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy/RerollStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRollSubcommand } from '../../options/roll.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class RollCaptureStrategy
{
    private static mathParser = new AddAndSubtractMathParser();
    public static key: PtuRollSubcommand.Capture = PtuRollSubcommand.Capture;
    public static ACCURACY_ROLL_AC = 6;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const trainerLevel = interaction.options.getInteger('trainer_level', true);
        const additionalModifierFormula = interaction.options.getString('additional_modifier') ?? '0';
        const accuracyModifierFormula = interaction.options.getString('accuracy_modifier') ?? '0';

        // Calculate the additional modifier
        const additionalModifier = this.mathParser.evaluate(additionalModifierFormula);

        if (additionalModifier === undefined)
        {
            await interaction.editReply(
                'An invalid additional modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).',
            );
            return true;
        }

        // Calculate the accuracy modifier
        const accuracyModifier = this.mathParser.evaluate(accuracyModifierFormula);

        if (accuracyModifier === undefined)
        {
            await interaction.editReply(
                'An invalid accuracy modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).',
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
                (acc + cur), 0,
            );

        if (accuracyRoll <= this.ACCURACY_ROLL_AC)
        {
            await this.sendMessage({
                interaction,
                strategies,
                message: `${Text.Ping.user(rerollCallbackOptions.newCallingUserId ?? interaction.user.id)} :game_die:\n`
                    + `${Text.bold('Accuracy')}: ${accuracyRoll}\n`
                    + `${Text.bold('Result')}: Failed to hit the Pokémon with the Pokéball`,
                rerollCallbackOptions,
            });
            return true;
        }

        // Make capture roll
        const captureRoll = new DiceLiteService({
            count: 1,
            sides: 100,
        })
            .roll()
            .reduce((acc, cur) =>
                (acc + cur), 0,
            );

        // Calculate the result
        const accuracyModifierToResult = (accuracyRoll === 20)
            ? -10
            : 0;
        const result = captureRoll - trainerLevel + accuracyModifierToResult + additionalModifier;

        // Create message text
        const finalAccuracyModifierFormula = this.getAccuracyModifierFormulaForResponse(accuracyModifierFormula);
        const resultFormula = this.getFinalResultModifierFormulaForResponse({
            captureRoll,
            trainerLevel,
            accuracyModifierToResult,
            additionalModifier,
        });

        const startOfMessage = (captureRoll === 1)
            ? `${Text.Ping.user(rerollCallbackOptions.newCallingUserId ?? interaction.user.id)} rolled a guaranteed capture!!!\n`
            : `${Text.Ping.user(rerollCallbackOptions.newCallingUserId ?? interaction.user.id)} :game_die:\n`;

        const endOfMessage = `${Text.bold('Accuracy')}: 1d20 (${accuracyRoll}) ${finalAccuracyModifierFormula}\n`
            + `${Text.bold('Capture')}: 1d100 (${captureRoll})\n`
            + `${Text.bold('Result')}: ${result} (${resultFormula})`;

        // Send message
        await this.sendMessage({
            interaction,
            strategies,
            message: startOfMessage + endOfMessage,
            rerollCallbackOptions,
        });

        return true;
    }

    private static async sendMessage({
        interaction,
        strategies,
        message,
        rerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    }: {
        interaction: ChatInputCommandInteraction;
        strategies: PtuStrategyMap;
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
                strategies,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });
    }

    private static getAccuracyModifierFormulaForResponse(accuracyModifierFormula: string): string
    {
        if (accuracyModifierFormula.trim() !== '0')
        {
            return accuracyModifierFormula;
        }

        return '';
    }

    private static getFinalResultModifierFormulaForResponse({
        captureRoll,
        trainerLevel,
        accuracyModifierToResult,
        additionalModifier,
    }: {
        captureRoll: number;
        trainerLevel: number;
        accuracyModifierToResult: number;
        additionalModifier: number;
    }): string
    {
        const accuracyModifierSign = this.getDisplaySign(accuracyModifierToResult);
        const additionalModifierSign = this.getDisplaySign(additionalModifier);

        const displayAccuracyModifier = this.getDisplayModifier(accuracyModifierToResult);
        const displayAdditionalModifier = this.getDisplayModifier(additionalModifier);

        const accuracyDisplay = [accuracyModifierSign, displayAccuracyModifier].join(' ');
        const additionalDisplay = [additionalModifierSign, displayAdditionalModifier].join(' ');

        return `${captureRoll} - ${trainerLevel}${accuracyDisplay.trim() !== '' ? ` ${accuracyDisplay}` : ''}${additionalDisplay.trim() !== '' ? ` ${additionalDisplay}` : ''}`;
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
