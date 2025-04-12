import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    InteractionResponse,
    InteractionUpdateOptions,
    Message,
    MessageCreateOptions,
} from 'discord.js';

import { type CommandName, DiscordInteractionCallbackType } from '../../types/discord.js';
import { PtuRandomPickupSubcommandResponse } from '../Ptu/strategies/random/types.js';
import { InteractionListenerRestartStyle, InteractionStrategy } from './InteractionStrategy.js';

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
    previousResponse?: Message<boolean> | InteractionResponse<boolean>;
}

type OnRerollCallback = (options: OnRerollCallbackOptions) => Promise<void | boolean | PtuRandomPickupSubcommandResponse>;

interface OnRerollButtonPressOptions
{
    buttonInteraction: ButtonInteraction;
    onRerollCallback: OnRerollCallback;
    previousResponse: Message<boolean> | InteractionResponse<boolean> | undefined;
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
        rerollCallbackOptions: { interactionCallbackType, previousResponse },
        onRerollCallback,
        commandName,
    }: {
        interaction: ChatInputCommandInteraction | ButtonInteraction;
        options: RerollInteractionOptions;
        rerollCallbackOptions: OnRerollCallbackOptions;
        onRerollCallback: OnRerollCallback;
        commandName: CommandName;
    }): Promise<void>
    {
        // Set up message response
        const rerollOptions = InteractionStrategy.getMessageData(
            options,
            /* istanbul ignore next */
            () => this.getButtonRowComponent(),
        );
        const handlerMap = {
            [DiscordInteractionCallbackType.EditReply]: () => interaction.editReply(rerollOptions as InteractionEditReplyOptions),
            [DiscordInteractionCallbackType.Update]: () => (interaction as ButtonInteraction).update(rerollOptions as InteractionUpdateOptions),
            [DiscordInteractionCallbackType.Followup]: async () =>
            {
                try
                {
                    return await interaction.followUp(rerollOptions as InteractionReplyOptions);
                }
                catch (error)
                {
                    // If listening for too long, the webhook token may be invalid.
                    // Thus, send the message to the channel instead.
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
                    if ((error as any)?.rawError?.message?.toLowerCase()?.includes('invalid webhook token'))
                    {
                        /* istanbul ignore next */
                        const message = ((interaction as ButtonInteraction)?.message as Message | undefined) || previousResponse;
                        /* istanbul ignore next */
                        const replyData: MessageCreateOptions = {
                            ...(rerollOptions.content ? { content: rerollOptions.content } : {}),
                            ...(rerollOptions.files ? { files: rerollOptions.files } : {}),
                            ...(rerollOptions.embeds ? { embeds: rerollOptions.embeds } : {}),
                            ...(rerollOptions.components ? { components: rerollOptions.components } : {}),
                            ...(rerollOptions.allowedMentions ? { allowedMentions: rerollOptions.allowedMentions } : {}),
                        };

                        if (message)
                        {
                            // Fetch just in case its an interaction response, then reply
                            const fetchedMessage = await message.fetch(true);
                            replyData.reply = {
                                messageReference: fetchedMessage,
                            };
                        }

                        return await interaction.channel?.send(replyData);
                    }

                    throw error;
                }
            },
        };

        // Send/Update message
        const response = await handlerMap[interactionCallbackType]();

        // Handle any interactions
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        InteractionStrategy.handleInteractions({
            interactionResponse: (interactionCallbackType === DiscordInteractionCallbackType.Update)
                ? (interaction as ButtonInteraction).message
                : response as Message<boolean>,
            commandName,
            restartStyle: InteractionListenerRestartStyle.OnSuccess,
            onInteraction: /* istanbul ignore next */ async (receivedInteraction) => await this.onRerollButtonPress({
                buttonInteraction: receivedInteraction as ButtonInteraction,
                onRerollCallback,
                previousResponse: response,
            }),
            getActionRowComponent: /* istanbul ignore next */ () => this.getButtonRowComponent(),
        });
    }

    private static async onRerollButtonPress({
        buttonInteraction,
        onRerollCallback,
        previousResponse,
    }: OnRerollButtonPressOptions): Promise<void>
    {
        await Promise.all([
            // Run callback
            await onRerollCallback({
                interactionCallbackType: DiscordInteractionCallbackType.Followup,
                newCallingUserId: buttonInteraction.user.id,
                previousResponse,
            }),

            // Update original message with the same content so
            // the buttons know that the interaction was successful
            await buttonInteraction.update(
                InteractionStrategy.getMessageData(
                    buttonInteraction.message.content,
                    /* istanbul ignore next */
                    () => this.getButtonRowComponent(),
                ),
            ),
        ]);
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
}
