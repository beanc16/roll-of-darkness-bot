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
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../constants/discord.js';
import type { CommandName } from '../../types/discord.js';

export enum ButtonListenerRestartStyle
{
    OnSuccess = 'onSuccess',
    Never = 'never',
}

export interface HandleButtonInteractionsOptions
{
    interactionResponse: Message<boolean>;
    commandName: CommandName;
    restartStyle: ButtonListenerRestartStyle;
    timeToWaitForInteractions?: number;
    onButtonPress: (buttonInteraction: ButtonInteraction) => Promise<void> | void;
    getButtonRowComponent: () => ActionRowBuilder<ButtonBuilder>;
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
    components: ActionRowBuilder<ButtonBuilder>[];
}

export class ButtonStrategy
{
    public static async handleButtonInteractions({
        interactionResponse,
        commandName,
        restartStyle,
        timeToWaitForInteractions = timeToWaitForCommandInteractions,
        onButtonPress,
        getButtonRowComponent,
        curRecursionDepth = 0,
        maxRecursionDepth,
    }: HandleButtonInteractionsOptions): Promise<void>
    {
        let buttonInteraction: ButtonInteraction | undefined;

        try
        {
            // Wait for button interactions
            buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: timeToWaitForInteractions,
            });

            await onButtonPress(buttonInteraction);

            if (
                restartStyle === ButtonListenerRestartStyle.OnSuccess
                && (maxRecursionDepth === undefined || (
                    maxRecursionDepth !== undefined
                    && curRecursionDepth < maxRecursionDepth
                ))
            )
            {
                // Restart listener
                // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
                this.handleButtonInteractions({
                    interactionResponse: buttonInteraction?.message ?? interactionResponse,
                    commandName,
                    restartStyle,
                    onButtonPress,
                    getButtonRowComponent,
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
                logger.error(`An unknown error occurred whilst handling button interactions for ${commandName}`, error);
            }

            // Disable paginated buttons upon non-deletes
            if (!messageWasDeleted)
            {
                // Disable each component
                const buttonRow = getButtonRowComponent();
                buttonRow.components.forEach(component => component.setDisabled(true));

                // Update message with the same content, but with disabled components
                const messageData = ButtonStrategy.getMessageData(
                    interactionResponse.content,
                    () => buttonRow,
                );

                if (messageTimedOut)
                {
                    // Fetch just in case its an interaction response, then reply
                    const fetchedMessage = await interactionResponse.fetch(true);
                    await fetchedMessage.edit(messageData);
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
        getButtonRowComponent: () => ActionRowBuilder<ButtonBuilder>,
    ): GetMessageDataResponse
    {
        const buttonRow = getButtonRowComponent();
        const typedOptions = (typeof options === 'string')
            ? { content: options }
            : options;

        return {
            ...typedOptions,
            components: [buttonRow],
        };
    }
}
