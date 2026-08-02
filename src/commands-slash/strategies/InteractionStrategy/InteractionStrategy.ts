import { logger } from '@beanc16/logger';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ComponentType,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    InteractionUpdateOptions,
    Message,
    RESTJSONErrorCodes,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../../constants/discord.js';
import type { CommandName } from '../../../types/discord.js';

export enum InteractionListenerRestartStyle
{
    OnSuccess = 'onSuccess',
    Never = 'never',
}

export interface HandleInteractionsOptions
{
    interactionResponse: Message<boolean>;
    commandName: CommandName;
    restartStyle: InteractionListenerRestartStyle;
    timeToWaitForInteractions?: number;
    onInteraction: (receivedInteraction: ButtonInteraction | StringSelectMenuInteraction) => Promise<void> | void;
    getActionRowComponent: () => ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>;
    curRecursionDepth?: number;
    maxRecursionDepth?: number; // This is to prevent infinite recursion and should only be used by unit tests
}

export type GetMessageDataOptions = string | (Omit<
    InteractionEditReplyOptions
    | InteractionReplyOptions
    | InteractionUpdateOptions, 'components'
>);

export interface GetMessageDataResponse extends Omit<InteractionEditReplyOptions | InteractionReplyOptions | InteractionUpdateOptions, 'components'>
{
    components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
}

export class InteractionStrategy
{
    public static async handleInteractions({
        interactionResponse,
        commandName,
        restartStyle,
        timeToWaitForInteractions = timeToWaitForCommandInteractions,
        onInteraction,
        getActionRowComponent,
        curRecursionDepth = 0,
        maxRecursionDepth,
    }: HandleInteractionsOptions): Promise<void>
    {
        let receivedInteraction: ButtonInteraction | StringSelectMenuInteraction | undefined;

        try
        {
            // Wait for valid interactions
            receivedInteraction = await interactionResponse.awaitMessageComponent({
                filter: /* istanbul ignore next */ (i) => (
                    i.componentType === ComponentType.Button
                    || i.componentType === ComponentType.StringSelect
                ),
                time: timeToWaitForInteractions,
            }) as ButtonInteraction | StringSelectMenuInteraction;

            await onInteraction(receivedInteraction);

            if (
                restartStyle === InteractionListenerRestartStyle.OnSuccess
                && (maxRecursionDepth === undefined || (
                    maxRecursionDepth !== undefined
                    && curRecursionDepth < maxRecursionDepth
                ))
            )
            {
                // Restart listener
                // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
                this.handleInteractions({
                    interactionResponse: receivedInteraction?.message ?? interactionResponse,
                    commandName,
                    restartStyle,
                    onInteraction,
                    getActionRowComponent,
                    curRecursionDepth: curRecursionDepth + 1,
                    maxRecursionDepth,
                });
            }
        }
        catch (error)
        {
            const errorPrefix = 'Collector received no interactions before ending with reason:';
            const messageTimedOut = (error as Error).message.includes(`${errorPrefix} time`);
            const messageWasDeleted = (error as Error).message.includes(`${errorPrefix} messageDelete`)
                || (error as { code: RESTJSONErrorCodes }).code === RESTJSONErrorCodes.UnknownMessage;

            // Ignore timeouts & deleted
            if (!messageTimedOut && !messageWasDeleted)
            {
                logger.error(`An unknown error occurred whilst handling interactions for ${commandName}`, error);
            }

            // Disable components upon non-deletes
            if (!messageWasDeleted)
            {
                // Disable each component
                const actionRow = getActionRowComponent();
                actionRow.components.forEach(component => component.setDisabled(true));

                // Update message with the same content, but with disabled components
                const messageData = InteractionStrategy.getMessageData(
                    interactionResponse.content,
                    () => actionRow,
                );

                if (messageTimedOut)
                {
                    // Fetch just in case its an interaction response, then reply
                    const fetchedMessage = await receivedInteraction?.channel?.messages.fetch(interactionResponse.id);
                    await fetchedMessage?.edit(messageData);
                }
                else
                {
                    await interactionResponse.edit(messageData);
                }
            }
        }
    }

    public static getMessageData(
        options: GetMessageDataOptions,
        getActionRowComponent: HandleInteractionsOptions['getActionRowComponent'],
    ): GetMessageDataResponse
    {
        const actionRow = getActionRowComponent();
        const typedOptions = (typeof options === 'string')
            ? { content: options }
            : options;

        return {
            ...typedOptions,
            components: [actionRow],
        };
    }
}
