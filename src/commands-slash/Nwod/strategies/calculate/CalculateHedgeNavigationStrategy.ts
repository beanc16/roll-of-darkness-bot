import { logger } from '@beanc16/logger';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    InteractionEditReplyOptions,
    Message,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../../../constants/discord.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { CalculateHedgeDicepoolModal } from '../../modals/calculate/CalculateHedgeDicepoolModal.js';
import {
    CurrentClarity,
    InitiativeModifier,
    NwodCalculateSubcommand,
    OpponentSpeed,
    Territory,
    TimeLimit,
} from '../../options/calculate.js';
import { CalculateChaseSuccessesStrategy, type ChaseSuccessesGetParameterResultsResponse } from './CalculateChaseSuccessesStrategy.js';

export interface GetParameterResultsResponse extends ChaseSuccessesGetParameterResultsResponse
{
    wyrdRating: number;
    currentClarity: CurrentClarity;
    timeLimit: TimeLimit;
    goblinDebtAccepted: number;
    huntsmanModifer: number;
    trodModifer: number;
}

enum CalculateHedgeNavigationButtonName
{
    CalculateHedgeDicepool = 'calculate_hedge_dicepool',
}

@staticImplements<ChatIteractionStrategy>()
export class CalculateHedgeNavigationStrategy
{
    public static key = NwodCalculateSubcommand.HedgeNavigation;

    /* istanbul ignore next */
    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const parameterResults = this.getParameterResults(interaction);

        // Calculate successes
        const successes = this.calculateSuccesses(parameterResults);

        // Send message
        const replyOptions = this.getMessageData(`You need a total of ${successes} successes to navigate the hedge.`);
        const response = await interaction.editReply(replyOptions);

        // Handle any interactions on the buttons
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        this.handleButtonInteractions({
            originalInteraction: interaction,
            interactionResponse: response,
            successes,
        });

        return true;
    }

    /* istanbul ignore next */
    private static getParameterResults(interaction: ChatInputCommandInteraction): GetParameterResultsResponse
    {
        // Required
        const opponentsSpeed = interaction.options.getString('opponents_speed', true) as OpponentSpeed;
        const initiativeModifier = interaction.options.getString('initiative_modifier', true) as InitiativeModifier;
        const territory = interaction.options.getString('territory', true) as Territory;
        const wyrdRating = interaction.options.getInteger('wyrd_rating', true);
        const currentClarity = interaction.options.getString('current_clarity', true) as CurrentClarity;
        const timeLimit = interaction.options.getString('time_limit', true) as TimeLimit;

        // Optional
        const opponentsTurnLead = interaction.options.getInteger('opponents_turn_lead') ?? 0;
        const sizeIsLowerThanOpponents = interaction.options.getBoolean('size_is_lower_than_opponents') ?? false;
        const opponentCannotBeTired = interaction.options.getBoolean('opponent_cannot_be_tired') ?? false;
        const environmentDangerModifier = interaction.options.getInteger('environment_danger_modifier') ?? 0;
        const goblinDebtAccepted = interaction.options.getInteger('goblin_debt_accepted') ?? 0;
        const huntsmanModifer = interaction.options.getInteger('huntsman_modifer') ?? 0;
        const trodModifer = interaction.options.getInteger('trod_modifer') ?? 0;

        return {
            opponentsSpeed,
            initiativeModifier,
            territory,
            wyrdRating,
            currentClarity,
            timeLimit,
            opponentsTurnLead,
            sizeIsLowerThanOpponents,
            opponentCannotBeTired,
            environmentDangerModifier,
            goblinDebtAccepted,
            huntsmanModifer,
            trodModifer,
        };
    }

    public static calculateSuccesses({
        opponentsSpeed,
        initiativeModifier,
        territory,
        wyrdRating,
        currentClarity,
        timeLimit,
        opponentsTurnLead,
        sizeIsLowerThanOpponents,
        opponentCannotBeTired,
        environmentDangerModifier,
        goblinDebtAccepted,
        huntsmanModifer,
        trodModifer,
    }: GetParameterResultsResponse): number
    {
        // Start with chase successes
        const successes = CalculateChaseSuccessesStrategy.calculateSuccesses({
            opponentsSpeed,
            initiativeModifier,
            territory,
            opponentsTurnLead,
            sizeIsLowerThanOpponents,
            opponentCannotBeTired,
            environmentDangerModifier,
        });

        // Create num maps to modifiers
        const currentClarityToModifier: Record<CurrentClarity, number> = {
            [CurrentClarity.FourOrHigher]: 0,
            [CurrentClarity.Three]: 1,
            [CurrentClarity.Two]: 2,
            [CurrentClarity.One]: 3,
        };
        const timeLimitToModifier: Record<TimeLimit, number> = {
            [TimeLimit.NotUrgent]: 0,
            [TimeLimit.SomewhatUrgent]: 1,
            [TimeLimit.MoreUrgent]: 2,
            [TimeLimit.MostUrgent]: 3,
        };

        // Get all modifiers (variables with a type of number are already modifiers)
        const currentClarityModifier = currentClarityToModifier[currentClarity];
        const timeLimitModifier = timeLimitToModifier[timeLimit];

        return Math.max(0, successes
            - wyrdRating
            + currentClarityModifier
            + timeLimitModifier
            - goblinDebtAccepted
            + huntsmanModifer
            + trodModifer);
    }

    /* istanbul ignore next */
    private static getMessageData(content: string): InteractionEditReplyOptions
    {
        const buttonRow = this.getButtonRowComponent();

        return {
            content,
            components: [buttonRow],
        };
    }

    /* istanbul ignore next */
    private static getButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const hedgeDicepoolButton = new ButtonBuilder()
            .setCustomId(CalculateHedgeNavigationButtonName.CalculateHedgeDicepool)
            .setLabel('Calculate Hedge Dicepool')
            .setEmoji('🧚')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(hedgeDicepoolButton);

        return row;
    }

    private static async handleButtonInteractions({
        originalInteraction,
        interactionResponse,
        successes,
    }: {
        originalInteraction: ChatInputCommandInteraction;
        interactionResponse: Message<boolean>;
        successes: number;
    }): Promise<void>
    {
        let buttonInteraction: ButtonInteraction | undefined;

        try
        {
            // Wait for button interactions
            buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: timeToWaitForCommandInteractions,
            });

            // Display modal to handle calculating the hedge's dicepool
            await CalculateHedgeDicepoolModal.showModal(buttonInteraction, {
                successes,
            });

            // Restart listener in case the modal isn't finished
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            this.handleButtonInteractions({
                originalInteraction,
                interactionResponse,
                successes,
            });
        }
        catch (error)
        {
            const errorPrefix = 'Collector received no interactions before ending with reason:';
            const messageTimedOut = (error as Error).message.includes(`${errorPrefix} time`);
            const messageWasDeleted = (error as Error).message.includes(`${errorPrefix} messageDelete`);

            // Ignore timeouts
            if (!messageTimedOut && !messageWasDeleted)
            {
                logger.error(`An unknown error occurred whilst handling reroll button interactions for /nwod calculate hedge_navigation`, error);
            }

            // Disable paginated buttons upon non-deletes
            if (!messageWasDeleted)
            {
                const messageData = this.getMessageData(
                    interactionResponse.content, // Use the message's original content
                );

                await originalInteraction.editReply(messageData);
            }
        }
    }
}
