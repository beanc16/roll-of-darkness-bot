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

import { type CommandName, DiscordInteractionCallbackType } from '../../../types/discord.js';
import { PtuRandomPickupSubcommandResponse } from '../../Ptu/strategies/random/types.js';
import { InteractionListenerRestartStyle, InteractionStrategy } from '../InteractionStrategy/InteractionStrategy.js';

export enum RerollButtonName
{
    Reroll = 'Reroll',
    TakeDramaticFailure = 'Take a Dramatic Failure',
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

type OnRerollCallback = (
    rerollCallbackOptions: OnRerollCallbackOptions,
    rerollButtonRowComponentOptions: Pick<RerollButtonRowComponentOptions, 'hasTakenDramaticFailure'>,
) => Promise<void | boolean | PtuRandomPickupSubcommandResponse>;

interface OnRerollButtonPressOptions extends RerollButtonRowComponentOptions
{
    buttonInteraction: ButtonInteraction;
    onRerollCallback: OnRerollCallback;
    previousResponse: Message<boolean> | InteractionResponse<boolean> | undefined;
}

export interface RerollButtonRowComponentOptions
{
    canTakeDramaticFailure?: boolean;
    hasTakenDramaticFailure?: boolean;
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
        canTakeDramaticFailure,
        hasTakenDramaticFailure,
    }: {
        interaction: ChatInputCommandInteraction | ButtonInteraction;
        options: RerollInteractionOptions;
        rerollCallbackOptions: OnRerollCallbackOptions;
        onRerollCallback: OnRerollCallback;
        commandName: CommandName;
    } & RerollButtonRowComponentOptions): Promise<void>
    {
        // Set up message response
        const rerollOptions = InteractionStrategy.getMessageData(
            options,
            /* istanbul ignore next */
            () => this.getButtonRowComponent({ canTakeDramaticFailure, hasTakenDramaticFailure }),
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
                canTakeDramaticFailure,
                hasTakenDramaticFailure,
            }),
            getActionRowComponent: /* istanbul ignore next */ () => this.getButtonRowComponent({ canTakeDramaticFailure, hasTakenDramaticFailure }),
        });
    }

    private static async onRerollButtonPress({
        buttonInteraction,
        onRerollCallback,
        previousResponse,
        canTakeDramaticFailure,
        hasTakenDramaticFailure,
    }: OnRerollButtonPressOptions): Promise<void>
    {
        const handlerMap: Record<RerollButtonName, () => Promise<void>> = {
            [RerollButtonName.Reroll]: async () =>
            {
                const {
                    message: {
                        content,
                        mentions: {
                            users: usersPingedInMessage,
                        },
                    },
                } = buttonInteraction;
                const userPingedInMessage = usersPingedInMessage.get(buttonInteraction.user.id);
                /* istanbul ignore next */
                const numOfTimesUserIsPinged = content.split(`${userPingedInMessage?.id ?? ''}`).length - 1;

                await Promise.all([
                    // Run callback
                    onRerollCallback({
                        interactionCallbackType: DiscordInteractionCallbackType.Followup,
                        newCallingUserId: buttonInteraction.user.id,
                        previousResponse,
                    }, { hasTakenDramaticFailure: false }),

                    // Update original message with the same content so
                    // the buttons know that the interaction was successful
                    buttonInteraction.update(
                        InteractionStrategy.getMessageData(
                            buttonInteraction.message.content,
                            /* istanbul ignore next */
                            () => this.getButtonRowComponent({
                                canTakeDramaticFailure,
                                hasTakenDramaticFailure: hasTakenDramaticFailure ?? numOfTimesUserIsPinged > 1,
                            }),
                        ),
                    ),
                ]);
            },
            [RerollButtonName.TakeDramaticFailure]: async () =>
            {
                const {
                    message: {
                        content,
                        mentions: {
                            users: usersPingedInMessage,
                        },
                    },
                } = buttonInteraction;
                const userPingedInMessage = usersPingedInMessage.get(buttonInteraction.user.id);
                /* istanbul ignore next */
                const numOfTimesUserIsPinged = content.split(`${userPingedInMessage?.id ?? ''}`).length - 1;

                // Only allow roll commands that the user of this command rolled
                if (!userPingedInMessage || buttonInteraction.user.id !== userPingedInMessage.id)
                {
                    await buttonInteraction.reply({
                        content: 'You can only take a dramatic failure on your own rolls.',
                        ephemeral: true,
                    });
                    return;
                }
                // Only take a dramatic failure once
                if (numOfTimesUserIsPinged > 1)
                {
                    await buttonInteraction.reply({
                        content: 'You can only take a dramatic failure for a beat once.',
                        ephemeral: true,
                    });
                    return;
                }

                const contentWithoutStrikethrough = content.replaceAll('~', '');
                const userPing = `<@${userPingedInMessage.id}>`;

                await buttonInteraction.update(
                    InteractionStrategy.getMessageData(
                        [
                            `~~${contentWithoutStrikethrough}~~`,
                            '',
                            `${userPing} took a Dramatic Failure for a beat 😈`,
                        ].join('\n'),
                        /* istanbul ignore next */
                        () => this.getButtonRowComponent({
                            canTakeDramaticFailure,
                            hasTakenDramaticFailure: true,
                        }),
                    ),
                );
                await buttonInteraction.followUp({
                    content: `${userPing} took a Dramatic Failure for a beat 😈`,
                });
            },
        };

        await handlerMap[buttonInteraction.customId as RerollButtonName]();
    }

    /* istanbul ignore next */
    private static getButtonRowComponent({ canTakeDramaticFailure, hasTakenDramaticFailure }: RerollButtonRowComponentOptions = {}): ActionRowBuilder<ButtonBuilder>
    {
        const diceButton = new ButtonBuilder()
            .setCustomId(RerollButtonName.Reroll)
            .setLabel(RerollButtonName.Reroll)
            .setEmoji('🎲')
            .setStyle(ButtonStyle.Secondary);

        const dramaticFailureButton = new ButtonBuilder()
            .setCustomId(RerollButtonName.TakeDramaticFailure)
            .setLabel(RerollButtonName.TakeDramaticFailure)
            .setEmoji('😈')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>({
            components: [
                diceButton,
                ...((canTakeDramaticFailure && hasTakenDramaticFailure !== true) ? [dramaticFailureButton] : []),
            ],
        });

        return row;
    }
}
