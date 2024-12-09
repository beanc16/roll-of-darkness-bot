import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    InteractionUpdateOptions,
    Message,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../../../constants/discord.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiceStringParser, ParseOptions } from '../../../../services/DiceStringParser.js';
import { AddAndSubtractMathParser } from '../../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import {
    OnRerollCallbackOptions,
    RerollInteractionOptions,
    RerollStrategy,
} from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuRollSubcommand } from '../../options/roll.js';

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
    messageContentOptions?: never;
    buttonInteraction: ButtonInteraction;
    damageResultString: string;
    finalRollResult: number;
    type: PtuAttackRollType;
    interactionCallbackType: DiscordInteractionCallbackType.Update;
    accuracyRoll: number;
    damageDicePoolExpression: string;
    shouldUseMaxCritRoll: boolean;
} | {
    interaction: ChatInputCommandInteraction;
    messageContentOptions: GetMessageContentOptions;
    buttonInteraction?: never;
    damageResultString: string;
    finalRollResult: number;
    type: PtuAttackRollType;
    interactionCallbackType: DiscordInteractionCallbackType.Followup;
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

interface GetAttackMessageDataResponse extends Omit<InteractionEditReplyOptions | InteractionReplyOptions | InteractionUpdateOptions, 'components'>
{
    components: ActionRowBuilder<ButtonBuilder>[];
}

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

@staticImplements<ChatIteractionStrategy>()
export class RollAttackStrategy
{
    private static mathParser = new AddAndSubtractMathParser();
    public static key: PtuRollSubcommand.Attack = PtuRollSubcommand.Attack;

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
        message: string;
        rerollCallbackOptions?: OnRerollCallbackOptions;
        damageResultString: string;
        finalRollResult: number;
    } & RollDamageOptions): Promise<void>
    {
        // Send message
        const handlerMap = {
            [DiscordInteractionCallbackType.EditReply]: () => interaction.editReply(
                this.getMessageData(message, true),
            ),
            [DiscordInteractionCallbackType.Followup]: () => interaction.followUp(
                this.getMessageData(message, true) as InteractionReplyOptions,
            ),
            [DiscordInteractionCallbackType.Update]: () => interaction.editReply(
                this.getMessageData(message, true),
            ),
        };
        const response = await handlerMap[rerollCallbackOptions.interactionCallbackType]();

        // Handle any interactions on the buttons
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        this.handleButtonInteractions({
            interaction,
            interactionResponse: response,
            damageResultString,
            finalRollResult,
            accuracyRoll,
            damageDicePoolExpression,
            shouldUseMaxCritRoll,
        });
    }

    // Show accuracy and damage roll, skipping
    /* istanbul ignore next */
    private static async skipAccuracyRollMessage({
        interaction,
        type,
        currentMessageContent,
        damageResultString,
        finalRollResult,
    }: {
        interaction: ChatInputCommandInteraction;
        type: PtuAttackRollType.AutoMiss | PtuAttackRollType.AutoCrit;
        currentMessageContent: string;
        rerollCallbackOptions?: OnRerollCallbackOptions;
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
            messageContentOptions,
            damageResultString,
            finalRollResult,
            type,
            interactionCallbackType: DiscordInteractionCallbackType.Followup,
        });
    }

    /* istanbul ignore next */
    private static async handleButtonInteractions({
        interaction,
        interactionResponse,
        damageResultString,
        finalRollResult,
        accuracyRoll,
        damageDicePoolExpression,
        shouldUseMaxCritRoll,
    }: {
        interaction: ChatInputCommandInteraction;
        interactionResponse: Message<boolean>;
        damageResultString: string;
        finalRollResult: number;
    } & RollDamageOptions): Promise<void>
    {
        let buttonInteraction: ButtonInteraction;

        try
        {
            // Wait for button interactions
            buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: timeToWaitForCommandInteractions,
            });

            await this.runRerollStrategy({
                interaction,
                buttonInteraction,
                damageResultString,
                finalRollResult,
                type: buttonInteraction.customId as PtuAttackRollType,
                interactionCallbackType: DiscordInteractionCallbackType.Update,
                accuracyRoll,
                damageDicePoolExpression,
                shouldUseMaxCritRoll,
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
            interactionCallbackType,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: 'ptu roll attack',
        });
    }

    /* istanbul ignore next */
    private static getMessageData(options: RerollInteractionOptions, includeButtons: boolean): GetAttackMessageDataResponse
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
