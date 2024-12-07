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

import { timeToWaitForCommandInteractions } from '../../constants/discord.js';
import { DiscordInteractionCallbackType } from '../../types/discord.js';
import { PtuRandomPickupSubcommandResponse } from '../Ptu/strategies/random/types.js';

enum RerollButtonName
{
    Reroll = 'reroll',
}

export type RerollInteractionOptions = string | Omit<
    InteractionEditReplyOptions
    | InteractionReplyOptions
    | InteractionUpdateOptions, 'components'
>;

export type RerollInteractionCallbackType = DiscordInteractionCallbackType.EditReply
    | DiscordInteractionCallbackType.Followup
    | DiscordInteractionCallbackType.Update;

export interface OnRerollCallbackOptions
{
    interactionCallbackType: RerollInteractionCallbackType;
    newCallingUserId?: string;
}

type OnRerollCallback = (options: OnRerollCallbackOptions) => Promise<void | boolean | PtuRandomPickupSubcommandResponse>;

export interface GetRerollMessageDataResponse extends Omit<InteractionEditReplyOptions | InteractionReplyOptions | InteractionUpdateOptions, 'components'>
{
    components: ActionRowBuilder<ButtonBuilder>[];
}

export class RerollStrategy
{
    /**
     * Add a dice button that runs a callback function
     * that's assumed to reroll a dice command when called.
     */
    public static async run({
        interaction,
        options,
        interactionCallbackType,
        onRerollCallback,
        commandName,
    }: {
        interaction: ChatInputCommandInteraction | ButtonInteraction;
        options: RerollInteractionOptions;
        interactionCallbackType: RerollInteractionCallbackType;
        onRerollCallback: OnRerollCallback;
        commandName: string;
    }): Promise<void>
    {
        // Set up message response
        const rerollOptions = this.getMessageData(options);
        const handlerMap = {
            [DiscordInteractionCallbackType.EditReply]: () => interaction.editReply(rerollOptions as InteractionEditReplyOptions),
            [DiscordInteractionCallbackType.Followup]: () => interaction.followUp(rerollOptions as InteractionReplyOptions),
            [DiscordInteractionCallbackType.Update]: () => (interaction as ButtonInteraction).update(rerollOptions as InteractionUpdateOptions),
        };

        // Send/Update message
        const response = await handlerMap[interactionCallbackType]();

        // Handle any interactions on the buttons
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        this.handleButtonInteractions({
            interactionResponse: (interactionCallbackType === DiscordInteractionCallbackType.Update)
                ? (interaction as ButtonInteraction).message
                : response as Message<boolean>,
            onRerollCallback,
            commandName,
        });
    }

    /* istanbul ignore next */
    private static getMessageData(options: RerollInteractionOptions): GetRerollMessageDataResponse
    {
        const buttonRow = this.getButtonRowComponent();
        const typedOptions = (typeof options === 'string')
            ? { content: options }
            : options;

        return {
            ...typedOptions,
            components: [buttonRow],
        };
    }

    /* istanbul ignore next */
    private static getButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const diceButton = new ButtonBuilder()
            .setCustomId(RerollButtonName.Reroll)
            .setLabel('Reroll')
            .setEmoji('🎲')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(diceButton);

        return row;
    }

    private static async handleButtonInteractions({
        interactionResponse,
        onRerollCallback,
        commandName,
    }: {
        interactionResponse: Message<boolean>;
        onRerollCallback: OnRerollCallback;
        commandName: string;
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

            await Promise.all([
                // Run callback
                await onRerollCallback({
                    interactionCallbackType: DiscordInteractionCallbackType.Followup,
                    newCallingUserId: buttonInteraction.user.id,
                }),

                // Update original message with the same content so
                // the buttons know that the interaction was successful
                await buttonInteraction.update(
                    this.getMessageData(buttonInteraction.message.content),
                ),
            ]);
        }
        catch (error)
        {
            // Ignore timeouts
            if ((error as Error).message !== 'Collector received no interactions before ending with reason: time')
            {
                logger.error(`An unknown error occurred whilst handling reroll button interactions for /${commandName}`, error);
            }
        }
        finally
        {
            // Restart listener upon timeout
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            this.handleButtonInteractions({
                interactionResponse: buttonInteraction?.message ?? interactionResponse,
                onRerollCallback,
                commandName,
            });
        }
    }
}
