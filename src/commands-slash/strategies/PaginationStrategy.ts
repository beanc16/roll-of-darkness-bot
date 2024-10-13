import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    Message,
} from 'discord.js';
import { timeToWaitForCommandInteractions } from '../../constants/discord.js';
import { logger } from '@beanc16/logger';

enum ButtonName {
    Next = 'next_page',
    Previous = 'previous_page',
    First = 'first_page',
    Last = 'last_page',
}

interface PaginationStrategyRunParameters
{
    originalInteraction: ChatInputCommandInteraction;
    embeds: EmbedBuilder[];
}

interface PaginationStrategySendPagedMessagesParameters extends PaginationStrategyRunParameters
{
    interactionResponse: Message<boolean>;
    pageIndex: number;
}

export class PaginationStrategy
{
    public static async run({
        originalInteraction,
        embeds,
    }: PaginationStrategyRunParameters)
    {
        // Only include pagination buttons if there's more than one embed message
        const components = (embeds.length > 1)
            ? [this.getPaginationRowComponent()]
            : [];

        // Send first embed message
        const response = await originalInteraction.editReply({
            embeds: [embeds[0]],
            components,
        });

        // Only listen for pagination buttons if there's more than one embed message
        if (embeds.length > 1)
        {
            await this.sendPagedMessages({
                originalInteraction,
                embeds,
                interactionResponse: response,
                pageIndex: 0,
            });
        }
    }

    private static async sendPagedMessages({
        originalInteraction,
        interactionResponse,
        embeds,
        pageIndex,
    }: PaginationStrategySendPagedMessagesParameters)
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
                pageIndex,
            });

            const paginationRow = PaginationStrategy.getPaginationRowComponent();
            await buttonInteraction.update({
                embeds: [embeds[newPageIndex]],
                components: [paginationRow],
            });

            hasUpdated = true;

            this.sendPagedMessages({
                originalInteraction,
                interactionResponse: buttonInteraction.message,
                embeds,
                pageIndex: newPageIndex,
            });
        }
        catch (error)
        {
            // Ignore timeouts
            if ((error as Error).message !== 'Collector received no interactions before ending with reason: time')
            {
                logger.error('An unknown error occurred whilst collecting pages', error);
            }

            // Remove paginated buttons upon timeout
            if (!hasUpdated)
            {
                originalInteraction.editReply({
                    embeds: [embeds[pageIndex]],
                    components: [],
                });
            }
        }
    }

    private static updatePageIndex({
        buttonInteraction,
        embeds,
        pageIndex,
    }: {
        buttonInteraction: ButtonInteraction;
        embeds: EmbedBuilder[];
        pageIndex: number;
    }): number
    {
        if (buttonInteraction.customId === ButtonName.Next)
        {
            pageIndex += 1;

            // Circle back around to the first page if after the last page
            if (pageIndex >= embeds.length)
            {
                pageIndex = 0;
            }
        }

        else if (buttonInteraction.customId === ButtonName.Previous)
        {
            pageIndex -= 1;

            // Circle back around to the last page if before the first page
            if (pageIndex < 0)
            {
                pageIndex = embeds.length - 1;
            }
        }

        else if (buttonInteraction.customId === ButtonName.First)
        {
            pageIndex = 0;
        }

        else if (buttonInteraction.customId === ButtonName.Last)
        {
            pageIndex = embeds.length - 1;
        }

        return pageIndex;
    }

    private static getPaginationRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const prevButton = new ButtonBuilder()
            .setCustomId(ButtonName.Previous)
            .setLabel('Previous')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary);

        const nextButton = new ButtonBuilder()
            .setCustomId(ButtonName.Next)
            .setLabel('Next')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary);

        const firstButton = new ButtonBuilder()
            .setCustomId(ButtonName.First)
            .setLabel('First')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary);

        const lastButton = new ButtonBuilder()
            .setCustomId(ButtonName.Last)
            .setLabel('Last')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                firstButton,
                prevButton,
                nextButton,
                lastButton,
            );

        return row;
    }
}