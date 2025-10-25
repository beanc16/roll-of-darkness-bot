import { Text } from '@beanc16/discordjs-helpers';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    InteractionReplyOptions,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/Dice/DiceLiteService.js';
import { DiceStringParser, ParseOptions } from '../../../../services/Dice/DiceStringParser.js';
import { AddAndSubtractMathParser } from '../../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { InteractionListenerRestartStyle, InteractionStrategy } from '../../../strategies/InteractionStrategy/InteractionStrategy.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy/RerollStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRollSubcommand } from '../../options/roll.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

enum AttackButtonName
{
    Hit = 'Hit',
    Miss = 'Miss',
    Crit = 'Crit',
}

enum PtuAttackRollType
{
    Hit = AttackButtonName.Hit,
    Miss = AttackButtonName.Miss,
    Crit = AttackButtonName.Crit,
    AutoMiss = 'auto_miss',
    AutoCrit = 'auto_crit',
}

type RunRerollStrategyOptions = {
    interaction: ChatInputCommandInteraction;
    strategies: PtuStrategyMap;
    messageContentOptions?: never;
    buttonInteraction: ButtonInteraction;
    damageResultString: string;
    finalRollResult: number;
    type: PtuAttackRollType;
    interactionCallbackType: DiscordInteractionCallbackType.Update;
    rerollCallbackOptions: OnRerollCallbackOptions;
    accuracyRoll: number;
    damageDicePoolExpression: string;
    shouldUseMaxCritRoll: boolean;
} | {
    interaction: ChatInputCommandInteraction;
    strategies: PtuStrategyMap;
    messageContentOptions: GetMessageContentOptions;
    buttonInteraction?: never;
    damageResultString: string;
    finalRollResult: number;
    type: PtuAttackRollType;
    interactionCallbackType: DiscordInteractionCallbackType.Followup;
    rerollCallbackOptions: OnRerollCallbackOptions;
    accuracyRoll?: never;
    damageDicePoolExpression?: never;
    shouldUseMaxCritRoll?: never;
};

type GetMessageContentOptions = {
    type: PtuAttackRollType.Miss | PtuAttackRollType.AutoMiss;
    currentMessageContent: string;
    damageResultString?: never;
    finalRollResult?: never;
} | {
    type: PtuAttackRollType.Hit | PtuAttackRollType.Crit | PtuAttackRollType.AutoCrit;
    currentMessageContent: string;
    damageResultString: string;
    finalRollResult: number;
};

interface RollDamageOptions
{
    accuracyRoll: number;
    damageDicePoolExpression: string;
    shouldUseMaxCritRoll: boolean;
    type?: PtuAttackRollType;
}

type RollDamageResponse = {
    finalRollResult: number;
    damageResultString: string;
} | undefined;

@staticImplements<PtuChatIteractionStrategy>()
export class RollAttackStrategy
{
    private static mathParser = new AddAndSubtractMathParser();
    public static key: PtuRollSubcommand.Attack = PtuRollSubcommand.Attack;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.Update,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('name');
        const damageDicePoolExpression = interaction.options.getString('damage_dice_pool', true);
        const accuracyModifierFormula = interaction.options.getString('accuracy_modifier') ?? '0';
        const shouldUseMaxCritRoll = interaction.options.getBoolean('should_use_max_crit_roll') ?? true;

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
            .reduce((acc, cur) => (acc + cur), 0);

        // Make damage roll
        const damageResult = this.rollDamage({
            accuracyRoll,
            damageDicePoolExpression,
            shouldUseMaxCritRoll,
        });

        if (damageResult === undefined)
        {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid damage dicepool was submitted. Include only valid dice, numbers, plus signs (+), and subtraction signs (-).`);
            return true;
        }

        const { damageResultString, finalRollResult } = damageResult;

        // Send message
        let accuracyModifierStr = '';

        if (accuracyModifier > 0)
        {
            accuracyModifierStr = `+${accuracyModifier}`;
        }
        else if (accuracyModifier < 0)
        {
            accuracyModifierStr = `${accuracyModifier}`;
        }

        const rollName = name ? ` ${Text.bold(name)}` : '';
        const messagePrefix = `${Text.Ping.user(
            rerollCallbackOptions.newCallingUserId ?? interaction.user.id)
        }${rollName} :game_die:\n`
        + `${Text.bold('Accuracy')}: 1d20${accuracyModifierStr} (${
            accuracyRoll + accuracyModifier
        })`;

        // Automatic miss
        if (accuracyRoll === 1)
        {
            await this.skipAccuracyRollMessage({
                interaction,
                strategies,
                type: PtuAttackRollType.AutoMiss,
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
                strategies,
                type: PtuAttackRollType.AutoCrit,
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
                strategies,
                message: messagePrefix,
                rerollCallbackOptions,
                damageResultString,
                finalRollResult,
                accuracyRoll,
                damageDicePoolExpression,
                shouldUseMaxCritRoll,
            });
        }

        return true;
    }

    // Show accuracy roll with hit/miss confirmation buttons
    /* istanbul ignore next */
    private static async sendAccuracyRollMessage({
        interaction,
        strategies,
        message,
        rerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.Update,
        },
        damageResultString,
        finalRollResult,
        accuracyRoll,
        damageDicePoolExpression,
        shouldUseMaxCritRoll,
    }: {
        interaction: ChatInputCommandInteraction;
        strategies: PtuStrategyMap;
        message: string;
        rerollCallbackOptions?: OnRerollCallbackOptions;
        damageResultString: string;
        finalRollResult: number;
    } & RollDamageOptions): Promise<void>
    {
        // Send message
        const handlerMap = {
            [DiscordInteractionCallbackType.EditReply]: () => interaction.editReply(
                InteractionStrategy.getMessageData(
                    message,
                    () => this.getButtonRowComponent(),
                ),
            ),
            [DiscordInteractionCallbackType.Followup]: () => interaction.followUp(
                InteractionStrategy.getMessageData(
                    message,
                    () => this.getButtonRowComponent(),
                ) as InteractionReplyOptions,
            ),
            [DiscordInteractionCallbackType.Update]: () => interaction.editReply(
                InteractionStrategy.getMessageData(
                    message,
                    () => this.getButtonRowComponent(),
                ),
            ),
        };
        const interactionResponse = await handlerMap[rerollCallbackOptions.interactionCallbackType]();

        // Handle any interactions
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        InteractionStrategy.handleInteractions({
            interactionResponse,
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
            restartStyle: InteractionListenerRestartStyle.Never,
            onInteraction: async (receivedInteraction) =>
            {
                await this.runRerollStrategy({
                    interaction,
                    buttonInteraction: receivedInteraction as ButtonInteraction,
                    strategies,
                    damageResultString,
                    finalRollResult,
                    type: receivedInteraction.customId as PtuAttackRollType,
                    interactionCallbackType: DiscordInteractionCallbackType.Update,
                    rerollCallbackOptions,
                    accuracyRoll,
                    damageDicePoolExpression,
                    shouldUseMaxCritRoll,
                });
            },
            getActionRowComponent: () => this.getButtonRowComponent(),
        });
    }

    // Show accuracy and damage roll, skipping
    /* istanbul ignore next */
    private static async skipAccuracyRollMessage({
        interaction,
        strategies,
        type,
        currentMessageContent,
        rerollCallbackOptions,
        damageResultString,
        finalRollResult,
    }: {
        interaction: ChatInputCommandInteraction;
        strategies: PtuStrategyMap;
        type: PtuAttackRollType.AutoMiss | PtuAttackRollType.AutoCrit;
        currentMessageContent: string;
        rerollCallbackOptions: OnRerollCallbackOptions;
        damageResultString: string;
        finalRollResult: number;
    }): Promise<void>
    {
        const messageContentOptions = (type === PtuAttackRollType.AutoMiss)
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
            strategies,
            messageContentOptions,
            damageResultString,
            finalRollResult,
            type,
            interactionCallbackType: DiscordInteractionCallbackType.Followup,
            rerollCallbackOptions,
        });
    }

    private static async runRerollStrategy({
        interaction,
        buttonInteraction,
        strategies,
        messageContentOptions,
        damageResultString,
        finalRollResult,
        type,
        interactionCallbackType,
        rerollCallbackOptions,
        accuracyRoll,
        damageDicePoolExpression,
        shouldUseMaxCritRoll,
    }: RunRerollStrategyOptions): Promise<void>
    {
        let newDamageResultString = damageResultString;
        let newFinalRollResult = finalRollResult;
        if (type === PtuAttackRollType.Crit)
        {
            const critDamageRoll = this.rollDamage({
                accuracyRoll: accuracyRoll as number,
                damageDicePoolExpression: damageDicePoolExpression as string,
                shouldUseMaxCritRoll: shouldUseMaxCritRoll as boolean,
                type,
            });

            newDamageResultString = critDamageRoll?.damageResultString ?? damageResultString;
            newFinalRollResult = critDamageRoll?.finalRollResult ?? finalRollResult;
        }

        const getMessageContentOptions = (
            type === PtuAttackRollType.Hit
            || type === PtuAttackRollType.Crit
            || type === PtuAttackRollType.AutoCrit
        )
            ? messageContentOptions ?? {
                type,
                currentMessageContent: buttonInteraction.message.content,
                damageResultString: newDamageResultString,
                finalRollResult: newFinalRollResult,
            }
            : messageContentOptions ?? { // Miss & Auto-Miss
                type,
                currentMessageContent: buttonInteraction.message.content,
            };

        // Update original message with the same content so
        // the buttons know that the interaction was successful
        await RerollStrategy.run({
            interaction: buttonInteraction ?? interaction,
            options: this.getMessageContent(getMessageContentOptions),
            rerollCallbackOptions: {
                ...rerollCallbackOptions,
                interactionCallbackType,
            },
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                strategies,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });
    }

    /* istanbul ignore next */
    private static getButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const critButton = new ButtonBuilder()
            .setCustomId(AttackButtonName.Crit)
            .setLabel(AttackButtonName.Crit)
            .setEmoji('🗡️')
            .setStyle(ButtonStyle.Primary);

        const hitButton = new ButtonBuilder()
            .setCustomId(AttackButtonName.Hit)
            .setLabel(AttackButtonName.Hit)
            .setEmoji('🎯')
            .setStyle(ButtonStyle.Success);

        const missButton = new ButtonBuilder()
            .setCustomId(AttackButtonName.Miss)
            .setLabel(AttackButtonName.Miss)
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                critButton,
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
        if (
            type === PtuAttackRollType.Hit
            || type === PtuAttackRollType.AutoCrit
            || type === PtuAttackRollType.Crit
        )
        {
            const damageLabelByType = {
                [PtuAttackRollType.Hit]: '',
                [PtuAttackRollType.AutoCrit]: 'Auto-Crit ',
                [PtuAttackRollType.Crit]: 'Crit ',
            };

            return currentMessageContent
                + `\n${Text.bold(`${damageLabelByType[type]}Damage`)}:${damageResultString}`
                + `\n${Text.bold('Total')}: ${finalRollResult}`;
        }

        if (type === PtuAttackRollType.Miss || type === PtuAttackRollType.AutoMiss)
        {
            const autoLabelByType = {
                [PtuAttackRollType.Miss]: '',
                [PtuAttackRollType.AutoMiss]: 'Auto-',
            };

            return `${currentMessageContent}\n${Text.bold(`❌ ${autoLabelByType[type]}Missed`)}`;
        }

        return currentMessageContent;
    }

    /* istanbul ignore next */
    private static rollDamage({
        accuracyRoll,
        damageDicePoolExpression,
        shouldUseMaxCritRoll,
        type,
    }: RollDamageOptions): RollDamageResponse
    {
        // Set up dice parser options for auto-crit handling.
        const options: ParseOptions = (accuracyRoll === 20 || type === PtuAttackRollType.Crit)
            ? {
                doubleFirstDie: true,
                doubleFirstModifier: true,
                shouldRollMaxOnSecondHalfOfDicepool: shouldUseMaxCritRoll,
            }
            : {};

        // Roll each dice and parse results to string for math parser.
        const damageRollResult = DiceStringParser.parseAndRoll(damageDicePoolExpression, options);

        if (damageRollResult === undefined)
        {
            return undefined;
        }

        const { unparsedMathString: unparsedDamageMathString, resultString: damageResultString } = damageRollResult;

        // Parse math string for results.
        const finalRollResult = this.mathParser.evaluate(unparsedDamageMathString);

        if (finalRollResult === undefined)
        {
            return undefined;
        }

        return {
            finalRollResult,
            damageResultString,
        };
    }
}
