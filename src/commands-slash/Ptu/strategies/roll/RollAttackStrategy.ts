import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    InteractionReplyOptions,
    Message,
} from 'discord.js';
import { Parser } from 'expr-eval';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRollSubcommand } from '../../subcommand-groups/roll.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { addAndSubtractMathParserOptions } from '../../../../constants/mathParserOptions.js';
import { OnRerollCallbackOptions, RerollInteractionOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { DiceStringParser } from '../../../../services/DiceStringParser.js';

enum AttackButtonName
{
    Hit = 'hit',
    Miss = 'miss',
}

type GetMessageContentOptions = {
    type: AttackButtonName.Miss | 'auto_miss';
    currentMessageContent: string;
    damageResultString?: never;
    finalRollResult?: never;
} | {
    type: AttackButtonName.Hit | 'auto_crit';
    currentMessageContent: string;
    damageResultString: string;
    finalRollResult: number;
};

@staticImplements<ChatIteractionStrategy>()
export class RollAttackStrategy
{
    private static mathParser = new Parser(addAndSubtractMathParserOptions);
    public static key = PtuRollSubcommand.Attack;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.Update,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('name');
        const damageDicePoolExpression = interaction.options.getString('damage_dice_pool', true);
        const accuracyModifierFormula = interaction.options.getString('accuracy_modifier') ?? '0';

        // Get result
        let unparsedDamageMathString: string, damageResultString: string, finalRollResult: number;

        // TODO: Handle critical hits for damage later
        try {
            // Roll each dice and parse results to string for math parser.
            const damageRollResult = DiceStringParser.parseAndRoll(damageDicePoolExpression);
            unparsedDamageMathString = damageRollResult.unparsedMathString;
            damageResultString = damageRollResult.resultString;
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid damage dicepool was submitted. Include only valid dice, plus signs (+), and subtraction signs (-).`);
            return true;
        }

        // Parse math string for results.
        try {
            finalRollResult = this.mathParser.evaluate(unparsedDamageMathString);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid damage dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
            return true;
        }

        // Calculate the accuracy modifier
        let accuracyModifier: number;
        try {
            accuracyModifier = this.mathParser.evaluate(accuracyModifierFormula);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(
                'An invalid accuracy modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).'
            );
            return true;
        }

        // Make accuracy roll
        const accuracyRoll = new DiceLiteService({
            count: 1,
            sides: 20,
        })
        .roll()
        .reduce((acc, cur) => (acc + cur), 0);

        // Send message
        const accuracyModifierStr = (accuracyModifier > 0)
            ? `+${accuracyModifier}`
            : (accuracyModifier < 0)
            ? `-${accuracyModifier}`
            : '';
        const rollName = name ? ` ${Text.bold(name)}` : '';
        const messagePrefix = `${Text.Ping.user(interaction.user.id)}${rollName} :game_die:\n`
        + `${Text.bold('Accuracy')}: 1d20${accuracyModifierStr} (${
            accuracyRoll + accuracyModifier
        })`;

        // Automatic miss
        if (accuracyRoll == 1)
        {
            await this.skipAccuracyRollMessage({
                interaction,
                type: 'auto_miss',
                currentMessageContent: messagePrefix,
                rerollCallbackOptions,
                damageResultString,
                finalRollResult,
            });
        }

        // Automatic hit
        else if (accuracyRoll === 20)
        {
            await this.skipAccuracyRollMessage({
                interaction,
                type: 'auto_crit',
                currentMessageContent: messagePrefix,
                rerollCallbackOptions,
                damageResultString,
                finalRollResult,
            });
        }

        else
        {
            await this.sendAccuracyRollMessage({
                interaction,
                message: messagePrefix,
                rerollCallbackOptions,
                damageResultString,
                finalRollResult,
            });
        }

        return true;
    }

    // Show accuracy roll with hit/miss confirmation buttons
    private static async sendAccuracyRollMessage({
        interaction,
        message,
        rerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.Update,
        },
        damageResultString,
        finalRollResult,
    }: {
        interaction: ChatInputCommandInteraction;
        message: string;
        rerollCallbackOptions?: OnRerollCallbackOptions;
        damageResultString: string;
        finalRollResult: number;
    })
    {
        // Send message
        const handlerMap = {
            [DiscordInteractionCallbackType.EditReply]: () => interaction.editReply(
                this.getMessageData(message, true)
            ),
            [DiscordInteractionCallbackType.Followup]: () => interaction.followUp(
                this.getMessageData(message, true) as InteractionReplyOptions
            ),
            [DiscordInteractionCallbackType.Update]: () => interaction.editReply(
                this.getMessageData(message, true)
            ),
        };
        const response = await handlerMap[rerollCallbackOptions.interactionCallbackType]();

        // Handle any interactions on the buttons
        this.handleButtonInteractions({
            interaction,
            interactionResponse: response,
            damageResultString,
            finalRollResult,
        });
    }

    // Show accuracy and damage roll, skipping 
    private static async skipAccuracyRollMessage({
        interaction,
        type,
        currentMessageContent,
        damageResultString,
        finalRollResult,
    }: {
        interaction: ChatInputCommandInteraction;
        type: 'auto_miss' | 'auto_crit';
        currentMessageContent: string;
        rerollCallbackOptions?: OnRerollCallbackOptions;
        damageResultString: string;
        finalRollResult: number;
    })
    {
        const messageContentOptions = (type === 'auto_miss')
            ? {
                type,
                currentMessageContent,
            }
            : {
                type,
                currentMessageContent,
                damageResultString,
                finalRollResult,
            };

        await this.runRerollStrategy({
            interaction,
            messageContentOptions,
            damageResultString,
            finalRollResult,
            type,
            interactionCallbackType: DiscordInteractionCallbackType.Followup,
        });
    }

    private static async handleButtonInteractions({
        interaction,
        interactionResponse,
        damageResultString,
        finalRollResult,
    }: {
        interaction: ChatInputCommandInteraction;
        interactionResponse: Message<boolean>;
        damageResultString: string;
        finalRollResult: number;
    })
    {
        let buttonInteraction: ButtonInteraction;

        try
        {
            // Wait for button interactions
            buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
            });

            await this.runRerollStrategy({
                interaction,
                buttonInteraction,
                damageResultString,
                finalRollResult,
                type: buttonInteraction.customId as AttackButtonName,
                interactionCallbackType: DiscordInteractionCallbackType.Update,
            });
        }
        catch (error)
        {
            // Ignore timeouts
            if ((error as Error).message !== 'Collector received no interactions before ending with reason: time')
            {
                logger.error(`An unknown error occurred whilst handling hit/miss button interactions for /ptu roll attack`, error);
            }
        }
    }

    private static async runRerollStrategy({
        interaction,
        buttonInteraction,
        messageContentOptions,
        damageResultString,
        finalRollResult,
        type,
        interactionCallbackType,
    }: {
        interaction: ChatInputCommandInteraction;
        messageContentOptions?: never;
        buttonInteraction: ButtonInteraction;
        damageResultString: string;
        finalRollResult: number;
        type: AttackButtonName | 'auto_miss' | 'auto_crit';
        interactionCallbackType: DiscordInteractionCallbackType.Update;
    } | {
        interaction: ChatInputCommandInteraction;
        messageContentOptions: GetMessageContentOptions;
        buttonInteraction?: never;
        damageResultString: string;
        finalRollResult: number;
        type: AttackButtonName | 'auto_miss' | 'auto_crit';
        interactionCallbackType: DiscordInteractionCallbackType.Followup;
    }): Promise<void>
    {
        const typeToButtonAttachName = {
            [AttackButtonName.Hit]: AttackButtonName.Hit,
            ['auto_crit']: AttackButtonName.Hit,
            [AttackButtonName.Miss]: AttackButtonName.Miss,
            ['auto_miss']: AttackButtonName.Miss,
        };

        const handlerMap: Record<AttackButtonName, () => Promise<void>> = {
            [AttackButtonName.Hit]: async () => await RerollStrategy.run({
                interaction: buttonInteraction ?? interaction,
                options: this.getMessageContent(messageContentOptions ?? {
                    type: AttackButtonName.Hit,
                    currentMessageContent: buttonInteraction.message.content,
                    damageResultString,
                    finalRollResult,
                }),
                interactionCallbackType,
                onRerollCallback: (newRerollCallbackOptions) => this.run(
                    interaction,
                    newRerollCallbackOptions,
                ),
                commandName: 'ptu roll attack',
            }),
            [AttackButtonName.Miss]: async () => await RerollStrategy.run({
                interaction: buttonInteraction ?? interaction,
                options: this.getMessageContent(messageContentOptions ?? {
                    type: AttackButtonName.Miss,
                    currentMessageContent: buttonInteraction.message.content,
                }),
                interactionCallbackType,
                onRerollCallback: (newRerollCallbackOptions) => this.run(
                    interaction,
                    newRerollCallbackOptions,
                ),
                commandName: 'ptu roll attack',
            }),
        };

        // Update original message with the same content so
        // the buttons know that the interaction was successful
        await handlerMap[typeToButtonAttachName[type]]();
    }

    private static getMessageData(options: RerollInteractionOptions, includeButtons: boolean)
    {
        const buttonRow = this.getButtonRowComponent();
        const typedOptions = (typeof options === 'string')
            ? { content: options }
            : options;

        return {
            ...typedOptions,
            components: [
                ...(includeButtons ? [buttonRow] : []),
            ],
        };
    }

    private static getButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const hitButton = new ButtonBuilder()
            .setCustomId(AttackButtonName.Hit)
            .setEmoji('🎯')
            .setStyle(ButtonStyle.Success);

        const missButton = new ButtonBuilder()
            .setCustomId(AttackButtonName.Miss)
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                hitButton,
                missButton,
            );

        return row;
    }

    private static getMessageContent({
        type,
        currentMessageContent = '',
        damageResultString,
        finalRollResult,
    }: GetMessageContentOptions): string
    {
        if (type === AttackButtonName.Hit || type === 'auto_crit')
        {
            const damageLabelStr = (type === 'auto_crit') ? 'Auto-Crit ' : '';

            return currentMessageContent
                + `\n${Text.bold(`${damageLabelStr}Damage`)}:${damageResultString}`
                + `\n${Text.bold('Total')}: ${finalRollResult}`
        }

        else if (type === AttackButtonName.Miss || type === 'auto_miss')
        {
            const autoLabelStr = (type === 'auto_miss') ? 'Auto-' : '';

            return `${currentMessageContent}\n${Text.bold(`❌ ${autoLabelStr}Missed`)}`;
        }

        return currentMessageContent;
    }
}
