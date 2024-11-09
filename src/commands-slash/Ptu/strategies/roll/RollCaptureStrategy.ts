import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRollSubcommand } from '../../subcommand-groups/roll.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { AddAndSubractMathParser } from '../../../../services/MathParser.js';

@staticImplements<ChatIteractionStrategy>()
export class RollCaptureStrategy
{
    private static mathParser = new AddAndSubractMathParser();
    public static key = PtuRollSubcommand.Capture;
    public static ACCURACY_ROLL_AC = 6;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const trainerLevel = interaction.options.getInteger('trainer_level', true);
        const additionalModifierFormula = interaction.options.getString('additional_modifier') ?? '0';

        // Calculate the additional modifier
        const additionalModifier = this.mathParser.evaluate(additionalModifierFormula);

        if (additionalModifier === undefined)
        {
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
            await this.sendMessage({
                interaction,
                message: `${Text.Ping.user(interaction.user.id)} :game_die:\n` +
                    `${Text.bold('Accuracy')}: ${accuracyRoll}\n` +
                    `${Text.bold('Result')}: Failed to hit the Pokémon with the Pokéball`,
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
            (acc + cur), 0
        );

        // Calculate the result
        const accuracyModifier = (accuracyRoll === 20)
            ? -10
            : 0;
        const result = captureRoll - trainerLevel + accuracyModifier + additionalModifier;

        // Create message text
        const startOfMessage = (captureRoll === 1)
            ? `${Text.Ping.user(interaction.user.id)} rolled a guaranteed capture!!!\n`
            : `${Text.Ping.user(interaction.user.id)} :game_die:\n`;

        const endOfMessage = `${Text.bold('Accuracy')}: 1d20 (${accuracyRoll})\n` +
                `${Text.bold('Capture')}: 1d100 (${captureRoll})\n` +
                `${Text.bold('Result')}: ${result}`;

        // Send message
        await this.sendMessage({
            interaction,
            message: startOfMessage + endOfMessage,
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
    })
    {
        await RerollStrategy.run({
            interaction,
            options: message,
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: (newRerollCallbackOptions) => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: 'ptu roll capture',
        });
    }
}
