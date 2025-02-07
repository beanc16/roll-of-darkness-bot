import {
    ActionRowBuilder,
    AttachmentPayload,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionEditReplyOptions,
    InteractionUpdateOptions,
    Message,
    MessageCreateOptions,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { CommandName } from '../../types/discord.js';
import { ButtonListenerRestartStyle, ButtonStrategy } from './ButtonStrategy.js';

export enum PaginationButtonName
{
    Next = 'next_page',
    Previous = 'previous_page',
    First = 'first_page',
    Last = 'last_page',
    Delete = 'delete_message',
}

export type PaginationInteractionType = 'editReply' | 'dm' | 'update';

interface PaginationStrategyRunParameters
{
    originalInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;
    commandName: CommandName;
    embeds?: EmbedBuilder[];
    files?: AttachmentPayload[];
    interactionType?: PaginationInteractionType;
    rowsAbovePagination?: [
        ActionRowBuilder<StringSelectMenuBuilder>?,
        ActionRowBuilder<StringSelectMenuBuilder>?,
        ActionRowBuilder<StringSelectMenuBuilder>?,
        ActionRowBuilder<StringSelectMenuBuilder>?,
    ];
    includeDeleteButton?: boolean;
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
        commandName,
        embeds,
        files,
        interactionType = 'editReply',
        rowsAbovePagination = [],
        includeDeleteButton = false,
    }: PaginationStrategyRunParameters): Promise<Message<boolean>>
    {
        const shouldPaginate = (
            (!!embeds && embeds.length > 1)
            || (!!files && files.length > 1)
        );

        const validRowsAbovePagination = rowsAbovePagination.filter(row => !!row);

        // Only include pagination buttons if there's more than one embed message
        let components = this.getComponents({
            validRowsAbovePagination,
            isDisabled: false,
            includeDeleteButton,
            includePaginationButtons: shouldPaginate,
        });

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

        // Only listen for pagination buttons if there's more than one component
        if (components && components.length > 0)
        {
            let pageIndex = 0;

            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            ButtonStrategy.handleButtonInteractions({
                interactionResponse: response,
                commandName,
                restartStyle: ButtonListenerRestartStyle.OnSuccess,
                onButtonPress: /* istanbul ignore next */ async (buttonInteraction) =>
                {
                    const { newPageIndex, deleteMessage } = this.updatePageIndex({
                        buttonInteraction,
                        embeds,
                        files,
                        pageIndex,
                    });

                    if (deleteMessage)
                    {
                        if (originalInteraction.user.id === buttonInteraction.user.id)
                        {
                            await originalInteraction.deleteReply();
                        }
                        else
                        {
                            await buttonInteraction.reply({
                                content: 'Only the user that ran this command can delete the message.',
                                ephemeral: true,
                            });
                        }

                        return;
                    }

                    pageIndex = newPageIndex;
                    components = this.getComponents({
                        validRowsAbovePagination,
                        isDisabled: false,
                        includeDeleteButton,
                        includePaginationButtons: shouldPaginate,
                    });
                    await buttonInteraction.update({
                        ...(embeds
                            ? { embeds: [embeds[pageIndex]] }
                            : {}
                        ),
                        ...(files
                            ? { files: [files[pageIndex]] }
                            : {}
                        ),
                        components,
                    });
                },
                getButtonRowComponent: /* istanbul ignore next */ () => this.getPaginationRowComponent({
                    isDisabled: false,
                    includeDeleteButton,
                    includePaginationButtons: shouldPaginate,
                }) ?? new ActionRowBuilder<ButtonBuilder>(),
            });
        }

        return response;
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
    }): { newPageIndex: number; deleteMessage: boolean }
    {
        let newPageIndex = startingPageIndex;
        let deleteMessage = false;
        const array = (embeds ?? files ?? []) as unknown[];

        const customId = buttonInteraction.customId as PaginationButtonName;

        if (customId === PaginationButtonName.Next)
        {
            newPageIndex += 1;

            // Circle back around to the first page if after the last page
            if (newPageIndex >= array.length)
            {
                newPageIndex = 0;
            }
        }

        else if (customId === PaginationButtonName.Previous)
        {
            newPageIndex -= 1;

            // Circle back around to the last page if before the first page
            if (newPageIndex < 0)
            {
                newPageIndex = (array.length || 1) - 1; // The || 1 is to prevent an incorrect index if the array is empty
            }
        }

        else if (customId === PaginationButtonName.First)
        {
            newPageIndex = 0;
        }

        else if (customId === PaginationButtonName.Last)
        {
            newPageIndex = (array.length || 1) - 1; // The || 1 is to prevent an incorrect index if the array is empty
        }

        else if (customId === PaginationButtonName.Delete)
        {
            deleteMessage = true;
        }

        return { newPageIndex, deleteMessage };
    }

    /* istanbul ignore next */
    private static getComponents({
        validRowsAbovePagination,
        isDisabled,
        includeDeleteButton,
        includePaginationButtons,
    }: {
        validRowsAbovePagination: ActionRowBuilder<StringSelectMenuBuilder>[];
        isDisabled: boolean;
        includeDeleteButton: boolean;
        includePaginationButtons: boolean;
    }): (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[] | undefined
    {
        const components = [...validRowsAbovePagination, this.getPaginationRowComponent({
            isDisabled,
            includeDeleteButton,
            includePaginationButtons,
        })].filter(row => !!row);

        if (components.length === 0)
        {
            return undefined;
        }

        return components;
    }

    /* istanbul ignore next */
    private static getPaginationRowComponent({
        isDisabled,
        includeDeleteButton,
        includePaginationButtons,
    }: {
        isDisabled: boolean;
        includeDeleteButton: boolean;
        includePaginationButtons: boolean;
    }): ActionRowBuilder<ButtonBuilder> | undefined
    {
        const prevButton = new ButtonBuilder()
            .setCustomId(PaginationButtonName.Previous)
            .setLabel('Previous')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const nextButton = new ButtonBuilder()
            .setCustomId(PaginationButtonName.Next)
            .setLabel('Next')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const firstButton = new ButtonBuilder()
            .setCustomId(PaginationButtonName.First)
            .setLabel('First')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const lastButton = new ButtonBuilder()
            .setCustomId(PaginationButtonName.Last)
            .setLabel('Last')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const deleteButton = new ButtonBuilder()
            .setCustomId(PaginationButtonName.Delete)
            .setLabel('Delete')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled);

        const components = [
            ...(includePaginationButtons
                ? [
                    firstButton,
                    prevButton,
                ]
                : []
            ),
            ...(includeDeleteButton ? [deleteButton] : []),
            ...(includePaginationButtons
                ? [
                    nextButton,
                    lastButton,
                ]
                : []
            ),
        ];

        if (components.length === 0)
        {
            return undefined;
        }

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(...components);

        return row;
    }

    /* istanbul ignore next */
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
            editReply: async () => await originalInteraction.editReply(parameters),
            dm: async () => await originalInteraction.user.send(parameters as MessageCreateOptions),
            update: async () =>
            {
                await (originalInteraction as StringSelectMenuInteraction).update(parameters as InteractionUpdateOptions);
                return (originalInteraction as StringSelectMenuInteraction).message;
            },
        };

        return handlerMap[interactionType]();
    }
}
