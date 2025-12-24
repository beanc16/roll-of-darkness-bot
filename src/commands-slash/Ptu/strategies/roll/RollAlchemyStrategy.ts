import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/Dice/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy/RerollStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import {
    PtuAlchemyActivityAndRest,
    PtuAlchemyBreaks,
    PtuAlchemyCatalystsAndExtras,
    PtuAlchemyLocation,
    PtuAlchemyPractice,
    PtuAlchemySustenance,
    PtuAlchemyTimeOfDay,
    PtuRollSubcommand,
} from '../../options/roll.js';
import { PtuSkillRankService } from '../../services/PtuSkillRankService/PtuSkillRankService.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import { PtuSkillRank } from '../../types/types.js';

@staticImplements<PtuChatIteractionStrategy>()
export class RollAlchemyStrategy
{
    public static key: PtuRollSubcommand.Alchemy = PtuRollSubcommand.Alchemy;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('occult_education_rank', true);
        const catalystsAndExtras = interaction.options.getString('catalysts_and_extras', true) as PtuAlchemyCatalystsAndExtras;
        const activityAndRest = interaction.options.getString('activity_and_rest', true) as PtuAlchemyActivityAndRest;
        const sustenance = interaction.options.getString('sustenance', true) as PtuAlchemySustenance;
        const timeOfDay = interaction.options.getString('time_of_day', true) as PtuAlchemyTimeOfDay;
        const breaks = interaction.options.getString('breaks', true) as PtuAlchemyBreaks;
        const location = interaction.options.getString('location', true) as PtuAlchemyLocation;
        const practice = interaction.options.getString('practice', true) as PtuAlchemyPractice;
        const itemName = interaction.options.getString('item_name', true);
        const miscModifier = interaction.options.getInteger('misc_modifier') ?? 0;

        // Get DC (roll to tie or exceed to succeed) & modifier
        const dc = this.getDc(catalystsAndExtras, location);
        const modifier = this.getModifier({
            catalystsAndExtras,
            activityAndRest,
            sustenance,
            timeOfDay,
            breaks,
            location,
            practice,
            miscModifier,
        });

        // Display invalid message if a lab is required
        if (dc === null || modifier === null)
        {
            const itemsThatRequireALab = [
                '2 catalysts & 4+ extras',
                '3 catalysts & any number of extras',
            ].join(', OR ');
            await interaction.editReply(
                [
                    'Invalid location and catalysts & extras combination.',
                    `Items with ${itemsThatRequireALab} always require a lab to alchemize.`,
                ].join(' '),
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

        // Send message
        await this.sendMessage({
            interaction,
            strategies,
            rerollCallbackOptions,
            numberOfDice,
            rolls,
            roll,
            itemName,
            dc,
            modifier,
        });

        return true;
    }

    /**
     * Calculate the DC
     * @returns {number | null} If null, the item cannot be alchemized. If number, the DC.
     */
    private static getDc(
        catalystsAndExtras: PtuAlchemyCatalystsAndExtras,
        location: PtuAlchemyLocation,
    ): number | null
    {
        // Return null if the number of catalysts & extras are invalid
        // for the given location
        switch (location)
        {
            case PtuAlchemyLocation.DistractingSpace:
            case PtuAlchemyLocation.AnySpace:
                // Always requires an alchemy lab:
                // 2 catalysts & 4+ extras
                // or: 3 catalysts and any number of extras
                if (new Set([
                    PtuAlchemyCatalystsAndExtras.TwoCatalystsHighExtras,
                    PtuAlchemyCatalystsAndExtras.ThreeCatalystsLowExtras,
                    PtuAlchemyCatalystsAndExtras.ThreeCatalystsMidExtras,
                    PtuAlchemyCatalystsAndExtras.ThreeCatalystsHighExtras,
                ]).has(catalystsAndExtras))
                {
                    return null;
                }
                break;
            case PtuAlchemyLocation.YourAlchemyLab:
                break;
            default:
                throw new Error(`Unknown location: ${location as PtuAlchemyLocation}`);
        }

        const handlerMap: Record<PtuAlchemyCatalystsAndExtras, PtuSkillRank> = {
            [PtuAlchemyCatalystsAndExtras.OneCatalystLowExtras]: PtuSkillRank.Untrained,
            [PtuAlchemyCatalystsAndExtras.OneCatalystMidExtras]: PtuSkillRank.Adept,
            [PtuAlchemyCatalystsAndExtras.OneCatalystHighExtras]: PtuSkillRank.Expert,
            [PtuAlchemyCatalystsAndExtras.TwoCatalystsLowExtras]: PtuSkillRank.Adept,
            [PtuAlchemyCatalystsAndExtras.TwoCatalystsMidExtras]: PtuSkillRank.Expert,
            [PtuAlchemyCatalystsAndExtras.TwoCatalystsHighExtras]: PtuSkillRank.Master,
            [PtuAlchemyCatalystsAndExtras.ThreeCatalystsLowExtras]: PtuSkillRank.Expert,
            [PtuAlchemyCatalystsAndExtras.ThreeCatalystsMidExtras]: PtuSkillRank.Master,
            [PtuAlchemyCatalystsAndExtras.ThreeCatalystsHighExtras]: PtuSkillRank.Virtuoso,
        };

        const rank = handlerMap[catalystsAndExtras];
        return PtuSkillRankService.getDc(rank);
    }

    /**
     * Calculate the modifier
     * @returns {number | null} If null, the item cannot be alchemized. If number, the modifier.
     */
    private static getModifier({
        catalystsAndExtras,
        activityAndRest,
        sustenance,
        timeOfDay,
        breaks,
        location,
        practice,
        miscModifier,
    }: {
        catalystsAndExtras: PtuAlchemyCatalystsAndExtras;
        activityAndRest: PtuAlchemyActivityAndRest;
        sustenance: PtuAlchemySustenance;
        timeOfDay: PtuAlchemyTimeOfDay;
        breaks: PtuAlchemyBreaks;
        location: PtuAlchemyLocation;
        practice: PtuAlchemyPractice;
        miscModifier: number;
    }): number | null
    {
        const locationModifier = this.getLocationModifier(catalystsAndExtras, location);

        if (locationModifier === null)
        {
            return null;
        }

        return this.getActivityAndRestModifier(activityAndRest)
            + this.getSustenanceModifier(sustenance)
            + this.getTimeOfDayModifier(timeOfDay)
            + this.getBreaksModifier(breaks)
            + locationModifier
            + this.getPracticeModifier(practice)
            + miscModifier;
    }

    private static getActivityAndRestModifier(activityAndRest: PtuAlchemyActivityAndRest): number
    {
        const handlerMap: Record<PtuAlchemyActivityAndRest, number> = {
            [PtuAlchemyActivityAndRest.Exhausted]: 3,
            [PtuAlchemyActivityAndRest.VeryTired]: 2,
            [PtuAlchemyActivityAndRest.Tired]: 1,
            [PtuAlchemyActivityAndRest.Neutral]: 0,
            [PtuAlchemyActivityAndRest.Rested]: -1,
            [PtuAlchemyActivityAndRest.WellRested]: -2,
            [PtuAlchemyActivityAndRest.ExtremelyRested]: -3,
        };

        return handlerMap[activityAndRest];
    }

    private static getSustenanceModifier(sustenance: PtuAlchemySustenance): number
    {
        const handlerMap: Record<PtuAlchemySustenance, number> = {
            [PtuAlchemySustenance.Malnourished]: 3,
            [PtuAlchemySustenance.StarvingOrDehydrated]: 2,
            [PtuAlchemySustenance.SlightlyHungryOrDehydrated]: 1,
            [PtuAlchemySustenance.EatingAndDrinkingWell]: 0,
        };

        return handlerMap[sustenance];
    }

    private static getTimeOfDayModifier(timeOfDay: PtuAlchemyTimeOfDay): number
    {
        const handlerMap: Record<PtuAlchemyTimeOfDay, number> = {
            [PtuAlchemyTimeOfDay.Horrible]: 2,
            [PtuAlchemyTimeOfDay.NotIdeal]: 1,
            [PtuAlchemyTimeOfDay.Reasonable]: 0,
            [PtuAlchemyTimeOfDay.PeakFocus]: -1,
        };

        return handlerMap[timeOfDay];
    }

    private static getBreaksModifier(breaks: PtuAlchemyBreaks): number
    {
        const handlerMap: Record<PtuAlchemyBreaks, number> = {
            [PtuAlchemyBreaks.NoBreaks]: 2,
            [PtuAlchemyBreaks.SomeBreaks]: 1,
            [PtuAlchemyBreaks.ReasonableBreaks]: 0,
        };

        return handlerMap[breaks];
    }

    private static getLocationModifier(
        catalystsAndExtras: PtuAlchemyCatalystsAndExtras,
        location: PtuAlchemyLocation,
    ): number | null
    {
        // Return null if the number of catalysts & extras are invalid
        // for the given location
        switch (location)
        {
            case PtuAlchemyLocation.DistractingSpace: {
                const handlerMap: Record<PtuAlchemyCatalystsAndExtras, number | null> = {
                    [PtuAlchemyCatalystsAndExtras.OneCatalystLowExtras]: 1,
                    [PtuAlchemyCatalystsAndExtras.OneCatalystMidExtras]: 2,
                    [PtuAlchemyCatalystsAndExtras.OneCatalystHighExtras]: 3,
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsLowExtras]: 3,
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsMidExtras]: 4,
                    // Always require an alchemy lab, invalid:
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsHighExtras]: null,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsLowExtras]: null,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsMidExtras]: null,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsHighExtras]: null,
                };

                return handlerMap[catalystsAndExtras];
            }
            case PtuAlchemyLocation.AnySpace: {
                const handlerMap: Record<PtuAlchemyCatalystsAndExtras, number | null> = {
                    [PtuAlchemyCatalystsAndExtras.OneCatalystLowExtras]: 0,
                    [PtuAlchemyCatalystsAndExtras.OneCatalystMidExtras]: 1,
                    [PtuAlchemyCatalystsAndExtras.OneCatalystHighExtras]: 2,
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsLowExtras]: 2,
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsMidExtras]: 3,
                    // Always require an alchemy lab, invalid:
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsHighExtras]: null,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsLowExtras]: null,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsMidExtras]: null,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsHighExtras]: null,
                };

                return handlerMap[catalystsAndExtras];
            }
            case PtuAlchemyLocation.YourAlchemyLab: {
                const handlerMap: Record<PtuAlchemyCatalystsAndExtras, number | null> = {
                    [PtuAlchemyCatalystsAndExtras.OneCatalystLowExtras]: -2,
                    [PtuAlchemyCatalystsAndExtras.OneCatalystMidExtras]: -1,
                    [PtuAlchemyCatalystsAndExtras.OneCatalystHighExtras]: 0,
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsLowExtras]: 0,
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsMidExtras]: 0,
                    // Always require an alchemy lab:
                    [PtuAlchemyCatalystsAndExtras.TwoCatalystsHighExtras]: 0,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsLowExtras]: 0,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsMidExtras]: 0,
                    [PtuAlchemyCatalystsAndExtras.ThreeCatalystsHighExtras]: 0,
                };

                return handlerMap[catalystsAndExtras];
            }
            default: {
                throw new Error(`Unknown location: ${location as PtuAlchemyLocation}`);
            }
        }
    }

    private static getPracticeModifier(practice: PtuAlchemyPractice): number
    {
        const handlerMap: Record<PtuAlchemyPractice, number> = {
            [PtuAlchemyPractice.FirstTime]: 1,
            [PtuAlchemyPractice.NotFirstTime]: 0,
        };

        return handlerMap[practice];
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

    private static async sendMessage({
        interaction,
        strategies,
        rerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
        numberOfDice,
        rolls,
        roll,
        itemName,
        dc,
        modifier,
    }: {
        interaction: ChatInputCommandInteraction;
        strategies: PtuStrategyMap;
        rerollCallbackOptions?: OnRerollCallbackOptions;
        numberOfDice: number;
        rolls: number[];
        roll: number;
        itemName: string;
        dc: number;
        modifier: number;
    }): Promise<void>
    {
        // Create modified DC & text
        const modifiedDc = dc + modifier;
        const dcFormula = this.getFinalResultModifierFormulaForResponse(
            dc,
            modifier,
        );
        const dcFormulaForDisplay = (roll.toString() === dcFormula)
            ? ''
            : ` (${dcFormula})`;

        // Create message text
        const successMessage = roll >= modifiedDc
            ? Text.bold(`✅ Success`)
            : Text.bold(`❌ Failed`);

        const message = [
            `${Text.Ping.user(rerollCallbackOptions.newCallingUserId ?? interaction.user.id)} :game_die:`,
            `${Text.bold('Roll')}: ${numberOfDice}d6 (${rolls.join(', ')})`,
            `${Text.bold(itemName)}: ${roll}`,
            `${Text.bold('DC')}: ${modifiedDc}${dcFormulaForDisplay}`,
            successMessage,
        ].join('\n');

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
}
