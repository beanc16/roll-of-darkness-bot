import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum PaginationButtonName
{
    Next = 'next_page',
    Previous = 'previous_page',
    First = 'first_page',
    Last = 'last_page',
    Delete = 'delete_message',
}

export class PaginationActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor({
        isDisabled = false,
        includeDeleteButton = false,
        includePaginationButtons = true,
    }: {
        isDisabled?: boolean;
        includeDeleteButton?: boolean;
        includePaginationButtons?: boolean;
    } = {})
    {
        super();

        const prevButton = new ButtonBuilder({
            custom_id: PaginationButtonName.Previous,
            label: 'Previous',
            emoji: '⬅️',
            style: ButtonStyle.Secondary,
            disabled: isDisabled,
        });

        const nextButton = new ButtonBuilder({
            custom_id: PaginationButtonName.Next,
            label: 'Next',
            emoji: '➡️',
            style: ButtonStyle.Secondary,
            disabled: isDisabled,
        });

        const firstButton = new ButtonBuilder({
            custom_id: PaginationButtonName.First,
            label: 'First',
            emoji: '⏪',
            style: ButtonStyle.Secondary,
            disabled: isDisabled,
        });

        const lastButton = new ButtonBuilder({
            custom_id: PaginationButtonName.Last,
            label: 'Last',
            emoji: '⏩',
            style: ButtonStyle.Secondary,
            disabled: isDisabled,
        });

        const deleteButton = new ButtonBuilder({
            custom_id: PaginationButtonName.Delete,
            label: 'Delete',
            emoji: '🗑️',
            style: ButtonStyle.Secondary,
            disabled: isDisabled,
        });

        if (includePaginationButtons)
        {
            this.addComponents(firstButton, prevButton);
        }

        if (includeDeleteButton)
        {
            this.addComponents(deleteButton);
        }

        if (includePaginationButtons)
        {
            this.addComponents(nextButton, lastButton);
        }
    }

    get hasComponents(): boolean
    {
        return (this.components.length !== 0);
    }
}
