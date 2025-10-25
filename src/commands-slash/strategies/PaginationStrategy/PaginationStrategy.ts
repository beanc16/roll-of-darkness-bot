import {
    ActionRowBuilder,
    AttachmentPayload,
    ButtonBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    InteractionUpdateOptions,
    Message,
    MessageCreateOptions,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { CommandName } from '../../../types/discord.js';
import { InteractionListenerRestartStyle, InteractionStrategy } from '../InteractionStrategy/InteractionStrategy.js';
import { PaginationActionRowBuilder, PaginationButtonName } from './components/PaginationActionRowBuilder.js';

export type PaginationInteractionType = 'editReply' | 'dm' | 'update' | 'followUp';

type RowAbovePagination = ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>;

export interface OnRowAbovePaginationButtonPressResponse extends Omit<InteractionUpdateOptions, 'components'>
{
    rowsAbovePagination?: PaginationStrategyRunParameters['rowsAbovePagination'];
    shouldUpdateMessage?: boolean;
}

export interface PaginationStrategyRunParameters
{
    originalInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;
    commandName: CommandName;
    content?: string;
    embeds?: EmbedBuilder[];
    files?: AttachmentPayload[];
    interactionType?: PaginationInteractionType;
    /** Can only be used with `interactionType: 'followUp'` */
    ephemeral?: boolean;
    rowsAbovePagination?: [
        RowAbovePagination?,
        RowAbovePagination?,
        RowAbovePagination?,
        RowAbovePagination?,
    ];
    onRowAbovePaginationButtonPress?: (receivedInteraction: ButtonInteraction | StringSelectMenuInteraction, options: {
        embeds?: EmbedBuilder[];
        files?: AttachmentPayload[];
    }) => Promise<OnRowAbovePaginationButtonPressResponse> | OnRowAbovePaginationButtonPressResponse;
    includeDeleteButton?: boolean;
}

interface OnButtonPressResponse
{
    pageIndex: number;
    components: RowAbovePagination[] | undefined;
    embeds: EmbedBuilder[] | undefined;
    files: AttachmentPayload[] | undefined;
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
        content,
        embeds,
        files,
        interactionType = 'editReply',
        ephemeral,
        rowsAbovePagination = [],
        onRowAbovePaginationButtonPress,
        includeDeleteButton = false,
    }: PaginationStrategyRunParameters): Promise<Message<boolean>>
    {
        const validRowsAbovePagination = rowsAbovePagination.filter(row => !!row);

        // Only include pagination buttons if there's more than one embed message
        let components = this.getComponents({
            validRowsAbovePagination,
            isDisabled: false,
            includeDeleteButton,
            includePaginationButtons: (
                (!!embeds && embeds.length > 1)
                || (!!files && files.length > 1)
            ),
        });

        // Send first embed message
        const response = await this.replyToOriginalInteraction({
            originalInteraction,
            interactionType,
            parameters: {
                content,
                ...(embeds
                    ? { embeds: [embeds[0]] }
                    : {}
                ),
                ...(files
                    ? { files: [files[0]] }
                    : {}
                ),
                components,
                ephemeral,
            },
        });

        // Only listen for pagination buttons if there's more than one component
        if (components && components.length > 0)
        {
            let pageIndex = 0;

            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            InteractionStrategy.handleInteractions({
                interactionResponse: response,
                commandName,
                restartStyle: InteractionListenerRestartStyle.OnSuccess,
                onInteraction: /* istanbul ignore next */ async (receivedInteraction) =>
                {
                    const onButtonPressResponse = await this.onButtonPress({
                        originalInteraction,
                        receivedInteraction,
                        response,
                        content,
                        embeds,
                        files,
                        pageIndex,
                        includeDeleteButton,
                        validRowsAbovePagination,
                        onRowAbovePaginationButtonPress,
                    });

                    if (onButtonPressResponse)
                    {
                        pageIndex = onButtonPressResponse.pageIndex;

                        /* eslint-disable no-param-reassign */
                        if (onButtonPressResponse.embeds)
                        {
                            embeds = onButtonPressResponse.embeds;
                        }

                        if (onButtonPressResponse.files)
                        {
                            files = onButtonPressResponse.files;
                        }
                        /* eslint-enable no-param-reassign */

                        if (onButtonPressResponse.components)
                        {
                            components = onButtonPressResponse.components;
                        }
                    }
                },
                getActionRowComponent: /* istanbul ignore next */ () => this.getPaginationRowComponent({
                    isDisabled: false,
                    includeDeleteButton,
                    includePaginationButtons: (
                        (!!embeds && embeds.length > 1)
                        || (!!files && files.length > 1)
                    ),
                }) ?? new ActionRowBuilder<ButtonBuilder>(),
            });
        }

        return response;
    }

    private static async onButtonPress({
        originalInteraction,
        receivedInteraction,
        response,
        content,
        embeds,
        files,
        pageIndex,
        includeDeleteButton,
        validRowsAbovePagination,
        onRowAbovePaginationButtonPress,
    }: Pick<PaginationStrategyRunParameters, 'originalInteraction' | 'content' | 'embeds' | 'files' | 'onRowAbovePaginationButtonPress'> & {
        receivedInteraction: ButtonInteraction | StringSelectMenuInteraction;
        response: Message<boolean>;
        pageIndex: number;
        includeDeleteButton: boolean;
        validRowsAbovePagination: RowAbovePagination[];
    }): Promise<OnButtonPressResponse | undefined>
    {
        const {
            newPageIndex,
            deleteMessage,
            isNonPaginationButtonPress,
        } = this.updatePageIndex({
            receivedInteraction,
            embeds,
            files,
            pageIndex,
        });

        const output: OnButtonPressResponse & { shouldUpdateMessage: boolean } = {
            pageIndex: newPageIndex,
            components: undefined,
            embeds: undefined,
            files: undefined,
            shouldUpdateMessage: true,
        };

        if (isNonPaginationButtonPress && onRowAbovePaginationButtonPress)
        {
            const {
                embeds: newEmbeds,
                files: newFiles,
                rowsAbovePagination = [],
                shouldUpdateMessage,
            } = await onRowAbovePaginationButtonPress(receivedInteraction, {
                ...(embeds
                    ? { embeds }
                    : {}
                ),
                ...(files
                    ? { files }
                    : {}
                ),
            }) ?? {};

            const newValidRowsAbovePagination = rowsAbovePagination.filter(row => !!row);

            if (newValidRowsAbovePagination.length > 0)
            {
                output.components = newValidRowsAbovePagination;
            }
            if (newEmbeds)
            {
                output.embeds = newEmbeds as EmbedBuilder[];
            }
            if (newFiles)
            {
                output.files = newFiles as AttachmentPayload[];
            }
            if (shouldUpdateMessage !== undefined)
            {
                output.shouldUpdateMessage = shouldUpdateMessage;
            }
        }

        output.components = this.getComponents({
            validRowsAbovePagination: output.components ?? validRowsAbovePagination,
            isDisabled: false,
            includeDeleteButton,
            includePaginationButtons: (
                (!!output.embeds && output.embeds.length > 1)
                || (!!embeds && embeds.length > 1)
                || (!!output.files && output.files.length > 1)
                || (!!files && files.length > 1)
            ),
        });

        if (deleteMessage)
        {
            if (originalInteraction.user.id === receivedInteraction.user.id)
            {
                await response.delete();
            }
            else
            {
                await receivedInteraction.reply({
                    content: 'Only the user that ran this command can delete the message.',
                    ephemeral: true,
                });
            }

            return undefined;
        }

        // Follow up or update the message (update will throw an error if it has been replied to)
        if (receivedInteraction.replied && output.shouldUpdateMessage)
        {
            await receivedInteraction.editReply({
                content,
                ...((output.embeds || embeds)
                    ? { embeds: [output.embeds?.[output.pageIndex] ?? embeds![output.pageIndex]] }
                    : {}
                ),
                ...((output.files || files)
                    ? { files: [output.files?.[output.pageIndex] ?? files![output.pageIndex]] }
                    : {}
                ),
                components: output.components,
            });
        }
        else if (output.shouldUpdateMessage)
        {
            await receivedInteraction.update({
                content,
                ...((output.embeds || embeds)
                    ? { embeds: [output.embeds?.[output.pageIndex] ?? embeds![output.pageIndex]] }
                    : {}
                ),
                ...((output.files || files)
                    ? { files: [output.files?.[output.pageIndex] ?? files![output.pageIndex]] }
                    : {}
                ),
                components: output.components,
            });
        }

        return output;
    }

    private static updatePageIndex({
        receivedInteraction,
        embeds,
        files,
        pageIndex: startingPageIndex,
    }: {
        receivedInteraction: ButtonInteraction | StringSelectMenuInteraction;
        embeds?: EmbedBuilder[];
        files?: AttachmentPayload[];
        pageIndex: number;
    }): { newPageIndex: number; deleteMessage: boolean; isNonPaginationButtonPress: boolean }
    {
        let newPageIndex = startingPageIndex;
        let deleteMessage = false;
        let isNonPaginationButtonPress = true;
        const array = (embeds ?? files ?? []) as unknown[];
        const { customId } = receivedInteraction;

        if (customId === PaginationButtonName.Next.toString())
        {
            isNonPaginationButtonPress = false;
            newPageIndex += 1;

            // Circle back around to the first page if after the last page
            if (newPageIndex >= array.length)
            {
                newPageIndex = 0;
            }
        }

        else if (customId === PaginationButtonName.Previous.toString())
        {
            isNonPaginationButtonPress = false;
            newPageIndex -= 1;

            // Circle back around to the last page if before the first page
            if (newPageIndex < 0)
            {
                newPageIndex = (array.length || 1) - 1; // The || 1 is to prevent an incorrect index if the array is empty
            }
        }

        else if (customId === PaginationButtonName.First.toString())
        {
            isNonPaginationButtonPress = false;
            newPageIndex = 0;
        }

        else if (customId === PaginationButtonName.Last.toString())
        {
            isNonPaginationButtonPress = false;
            newPageIndex = (array.length || 1) - 1; // The || 1 is to prevent an incorrect index if the array is empty
        }

        else if (customId === PaginationButtonName.Delete.toString())
        {
            isNonPaginationButtonPress = false;
            deleteMessage = true;
        }

        return {
            newPageIndex,
            deleteMessage,
            isNonPaginationButtonPress,
        };
    }

    /* istanbul ignore next */
    private static getComponents({
        validRowsAbovePagination,
        isDisabled,
        includeDeleteButton,
        includePaginationButtons,
    }: {
        validRowsAbovePagination: RowAbovePagination[];
        isDisabled: boolean;
        includeDeleteButton: boolean;
        includePaginationButtons: boolean;
    }): RowAbovePagination[] | undefined
    {
        const components = [...validRowsAbovePagination, this.getPaginationRowComponent({
            isDisabled,
            includeDeleteButton,
            includePaginationButtons,
        })].filter(row => !!row && row?.components?.length !== undefined && row.components.length > 0) as RowAbovePagination[];

        if (components.length === 0)
        {
            return undefined;
        }

        return components;
    }

    /* istanbul ignore next */
    private static getPaginationRowComponent(input: {
        isDisabled: boolean;
        includeDeleteButton: boolean;
        includePaginationButtons: boolean;
    }): PaginationActionRowBuilder | undefined
    {
        const row = new PaginationActionRowBuilder(input);

        if (!row.hasComponents())
        {
            return undefined;
        }

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
        parameters: InteractionEditReplyOptions | InteractionUpdateOptions | InteractionReplyOptions | MessageCreateOptions;
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
            followUp: async () => await originalInteraction.followUp(parameters as InteractionReplyOptions),
        };

        return handlerMap[interactionType]();
    }
}
