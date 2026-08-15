import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/Dice/DiceLiteService.js';
import { AddAndSubtractMathParser } from '../../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions } from '../../../strategies/RerollStrategy/RerollStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuRollSubcommand } from '../../options/roll.js';
import { PtuDamageChartService } from '../../services/PtuDamageChartService.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import type { LookupMoveStrategy } from '../lookup/LookupMoveStrategy.js';
import type { RollAttackStrategy } from './RollAttackStrategy.js';

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

@staticImplements<PtuChatIteractionStrategy>()
export class RollFiveStrikeStrategy
{
    private static mathParser = new AddAndSubtractMathParser();
    public static key: PtuRollSubcommand.FiveStrike = PtuRollSubcommand.FiveStrike;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.Update,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const moveName = interaction.options.getString(PtuAutocompleteParameterName.MoveName, true);
        const hasStab = interaction.options.getBoolean('has_stab', true);
        const dbBonus = interaction.options.getInteger('damage_base_bonus') ?? 0;
        const bonusDamageDicePoolExpression = interaction.options.getString('bonus_damage_dice_pool');
        const accuracyModifierFormula = interaction.options.getString('accuracy_modifier') ?? '0';
        const shouldUseMaxCritRoll = interaction.options.getBoolean('should_use_max_crit_roll') ?? true;

        const RollAttackStrategy = this.getRollAttackStrategy(strategies);

        // Calculate the number of times hit
        const numOfTimesHitResult = this.getNumberOfHits();

        if (numOfTimesHitResult === undefined)
        {
            await interaction.editReply(
                'An unknown error occurred when calculating the number of times hit. Please try again.',
            );
            return true;
        }

        const { numOfTimesHit, numOfTimesHitsRoll } = numOfTimesHitResult;

        // Get damage dice pool
        const damageBase = await this.getMoveDamageBase({
            moveName,
            hasStab,
            dbBonus,
            numOfTimesHit,
            strategies,
        });

        if (typeof damageBase !== 'number' && damageBase.error === 'move_not_found')
        {
            await interaction.editReply(
                'Could not find a move with that name. Please try again.',
            );
            return true;
        }
        if (typeof damageBase !== 'number' && damageBase.error === 'no_damage_base')
        {
            await interaction.editReply(
                'That move does not have a damage base.',
            );
            return true;
        }

        const { dicepool: damageDicePool } = PtuDamageChartService.getDamageChartByDamageBase(damageBase as number);

        // Calculate the accuracy modifier
        const accuracyModifier = this.mathParser.evaluate(accuracyModifierFormula);

        if (accuracyModifier === undefined)
        {
            await interaction.editReply(
                'An invalid accuracy modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).',
            );
            return true;
        }

        // Make rolls
        const accuracyRoll = RollAttackStrategy.rollAccuracy();

        const damageDicePoolExpression = [
            damageDicePool,
            ...(bonusDamageDicePoolExpression ? [bonusDamageDicePoolExpression] : []),
        ].join(' + ');
        const damageResult = RollAttackStrategy.rollDamage({
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
        const messagePrefix = RollAttackStrategy.getMessagePrefix({
            interaction,
            moveName,
            accuracyModifier,
            accuracyRolls: [accuracyRoll],
            accuracyPrefix: [
                `${Text.bold('Number of Hits')}: 1d8 (${numOfTimesHitsRoll})`,
                `${numOfTimesHit} Hit${numOfTimesHit === 1 ? '' : 's'}`,
            ].join(' | ') + '\n',
            rerollCallbackOptions,
        });

        // Automatic miss
        if (accuracyRoll === 1)
        {
            await RollAttackStrategy.skipAccuracyRollMessage({
                interaction,
                strategies,
                type: PtuAttackRollType.AutoMiss,
                currentMessageContent: messagePrefix,
                currentStrategy: this,
                rerollCallbackOptions,
                damageResultString,
                finalRollResult,
            });
        }

        // Automatic hit
        else if (accuracyRoll === 20)
        {
            await RollAttackStrategy.skipAccuracyRollMessage({
                interaction,
                strategies,
                type: PtuAttackRollType.AutoCrit,
                currentMessageContent: messagePrefix,
                currentStrategy: this,
                rerollCallbackOptions,
                damageResultString,
                finalRollResult,
            });
        }

        else
        {
            await RollAttackStrategy.sendAccuracyRollMessage({
                interaction,
                strategies,
                message: messagePrefix,
                currentStrategy: this,
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

    private static async getMoveDamageBase({
        moveName,
        hasStab,
        dbBonus,
        numOfTimesHit,
        strategies,
    }: {
        moveName: string;
        hasStab: boolean;
        dbBonus: number;
        numOfTimesHit: number;
        strategies: PtuStrategyMap;
    }): Promise<number | { error: 'move_not_found' | 'no_damage_base' }>
    {
        const [move] = await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Move] as typeof LookupMoveStrategy).getLookupData({
            names: [moveName],
        });

        if (!move)
        {
            return { error: 'move_not_found' };
        }

        const { damageBase } = move;

        if (damageBase === undefined)
        {
            return { error: 'no_damage_base' };
        }

        const fullDbBonus = dbBonus + (hasStab ? 2 : 0);
        return damageBase * numOfTimesHit + fullDbBonus;
    }

    private static getNumberOfHits(): { numOfTimesHit: number; numOfTimesHitsRoll: number } | undefined
    {
        const [numOfTimesHitsRoll] = new DiceLiteService({
            count: 1,
            sides: 8,
        })
            .roll();

        let numOfTimesHit: number;
        switch (numOfTimesHitsRoll)
        {
            case 1:
                numOfTimesHit = 1;
                break;
            case 2:
            case 3:
                numOfTimesHit = 2;
                break;
            case 4:
            case 5:
            case 6:
                numOfTimesHit = 3;
                break;
            case 7:
                numOfTimesHit = 4;
                break;
            case 8:
                numOfTimesHit = 5;
                break;
            default:
                return undefined;
        }

        return { numOfTimesHit, numOfTimesHitsRoll };
    }

    private static getRollAttackStrategy(strategies: PtuStrategyMap): typeof RollAttackStrategy
    {
        return strategies[PtuSubcommandGroup.Roll][PtuRollSubcommand.Attack] as typeof RollAttackStrategy;
    }
}
