import { logger } from '@beanc16/logger';
import {
    ActionRowBuilder,
    AttachmentPayload,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    InteractionEditReplyOptions,
    InteractionUpdateOptions,
    Message,
    MessageCreateOptions,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../constants/discord.js';

enum ButtonName
{
    Next = 'next_page',
    Previous = 'previous_page',
    First = 'first_page',
    Last = 'last_page',
}

export type PaginationInteractionType = 'editReply' | 'dm' | 'update';

interface PaginationStrategyRunParameters
{
    originalInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;
    embeds?: EmbedBuilder[];
    files?: AttachmentPayload[];
    interactionType?: PaginationInteractionType;
    rowsAbovePagination?: [
        ActionRowBuilder<StringSelectMenuBuilder>?,
        ActionRowBuilder<StringSelectMenuBuilder>?,
        ActionRowBuilder<StringSelectMenuBuilder>?,
        ActionRowBuilder<StringSelectMenuBuilder>?,
    ];
}

interface PaginationStrategySendPagedMessagesParameters extends PaginationStrategyRunParameters
{
    interactionResponse: Message<boolean>;
    pageIndex: number;
}

export class PaginationStrategy
{
    /**
     * Paginate an interaction with an array of embeds or files.
     *
     * While embeds and files are both listed as optional, including
     * one of them is required in order to get paging.
     *
     * If an embeds or files array only has one element, then a
     * message will be sent, but pagination buttons will not be added.
     */
    public static async run({
        originalInteraction,
        embeds,
        files,
        interactionType = 'editReply',
        rowsAbovePagination = [],
    }: PaginationStrategyRunParameters): Promise<Message<boolean>>
    {
        const shouldPaginate = (
            (embeds && embeds.length > 1)
            || (files && files.length > 1)
        );

        const validRowsAbovePagination = rowsAbovePagination.filter(row => !!row);

        // Only include pagination buttons if there's more than one embed message
        const components = (shouldPaginate)
            ? [...validRowsAbovePagination, this.getPaginationRowComponent(false)]
            : validRowsAbovePagination;

        // Send first embed message
        const response = await this.replyToOriginalInteraction({
            originalInteraction,
            interactionType,
            parameters: {
                ...(embeds
                    ? { embeds: [embeds[0]] }
                    : {}
                ),
                ...(files
                    ? { files: [files[0]] }
                    : {}
                ),
                components,
            },
        });

        // Only listen for pagination buttons if there's more than one embed message
        if (shouldPaginate)
        {
            this.sendPagedMessages({
                originalInteraction,
                embeds,
                files,
                interactionResponse: response as Message,
                pageIndex: 0,
            });
        }

        return response;
    }

    private static async sendPagedMessages({
        originalInteraction,
        embeds,
        files,
        interactionResponse,
        pageIndex,
    }: PaginationStrategySendPagedMessagesParameters): Promise<void>
    {
        let hasUpdated = false;

        try
        {
            const buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: timeToWaitForCommandInteractions,
            });

            const newPageIndex = this.updatePageIndex({
                buttonInteraction,
                embeds,
                files,
                pageIndex,
            });

            const paginationRow = PaginationStrategy.getPaginationRowComponent(false);
            await buttonInteraction.update({
                ...(embeds
                    ? { embeds: [embeds[newPageIndex]] }
                    : {}
                ),
                ...(files
                    ? { files: [files[newPageIndex]] }
                    : {}
                ),
                components: [paginationRow],
            });

            hasUpdated = true;

            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            this.sendPagedMessages({
                originalInteraction,
                interactionType: 'editReply',
                interactionResponse: buttonInteraction.message,
                embeds,
                files,
                pageIndex: newPageIndex,
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
                logger.error('An unknown error occurred whilst collecting pages', error);
            }

            // Disable paginated buttons upon delete
            if (!hasUpdated && !messageWasDeleted)
            {
                const paginationRow = this.getPaginationRowComponent(true);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
                this.replyToOriginalInteraction({
                    originalInteraction,
                    interactionType: 'editReply',
                    parameters: {
                        ...(embeds
                            ? { embeds: [embeds[pageIndex]] }
                            : {}
                        ),
                        ...(files
                            ? { files: [files[pageIndex]] }
                            : {}
                        ),
                        components: [paginationRow],
                    },
                });
            }
        }
    }

    private static updatePageIndex({
        buttonInteraction,
        embeds,
        files,
        pageIndex: startingPageIndex,
    }: {
        buttonInteraction: ButtonInteraction;
        embeds?: EmbedBuilder[];
        files?: AttachmentPayload[];
        pageIndex: number;
    }): number
    {
        let pageIndex = startingPageIndex;
        const array = (embeds ?? files) as unknown[];

        const customId = buttonInteraction.customId as ButtonName;

        if (customId === ButtonName.Next)
        {
            pageIndex += 1;

            // Circle back around to the first page if after the last page
            if (pageIndex >= array.length)
            {
                pageIndex = 0;
            }
        }

        else if (customId === ButtonName.Previous)
        {
            pageIndex -= 1;

            // Circle back around to the last page if before the first page
            if (pageIndex < 0)
            {
                pageIndex = array.length - 1;
            }
        }

        else if (customId === ButtonName.First)
        {
            pageIndex = 0;
        }

        else if (customId === ButtonName.Last)
        {
            pageIndex = array.length - 1;
        }

        return pageIndex;
    }

    private static getPaginationRowComponent(isDisabled: boolean): ActionRowBuilder<ButtonBuilder>
    {
        const prevButton = new ButtonBuilder()
            .setCustomId(ButtonName.Previous)
            .setLabel('Previous')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const nextButton = new ButtonBuilder()
            .setCustomId(ButtonName.Next)
            .setLabel('Next')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const firstButton = new ButtonBuilder()
            .setCustomId(ButtonName.First)
            .setLabel('First')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const lastButton = new ButtonBuilder()
            .setCustomId(ButtonName.Last)
            .setLabel('Last')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                firstButton,
                prevButton,
                nextButton,
                lastButton,
            );

        return row;
    }

    private static replyToOriginalInteraction({
        originalInteraction,
        interactionType,
        parameters,
    }: {
        originalInteraction: PaginationStrategyRunParameters['originalInteraction'];
        interactionType: NonNullable<PaginationStrategyRunParameters['interactionType']>;
        parameters: InteractionEditReplyOptions | InteractionUpdateOptions | MessageCreateOptions;
    }): Promise<Message>
    {
        const handlerMap: Record<
            NonNullable<PaginationStrategyRunParameters['interactionType']>,
            () => Promise<Message>
        > = {
            editReply: async () =>
            {
                return await originalInteraction.editReply(parameters);
            },
            dm: async () =>
            {
                return await originalInteraction.user.send(parameters as MessageCreateOptions);
            },
            update: async () =>
            {
                await (originalInteraction as StringSelectMenuInteraction).update(parameters as InteractionUpdateOptions);
                return (originalInteraction as StringSelectMenuInteraction).message;
            },
        };

        return handlerMap[interactionType]();
    }
}
