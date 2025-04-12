import {
    ActionRowBuilder,
    EmbedBuilder,
    Message,
    SelectMenuComponentOptionData,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { chunkArray } from '../../services/chunkArray.js';
import { CommandName } from '../../types/discord.js';
import { InteractionListenerRestartStyle, InteractionStrategy } from '../strategies/InteractionStrategy.js';

type OnSelect = (receivedInteraction: StringSelectMenuInteraction) => Promise<void> | void;

export enum PageNavigation
{
    Previous = '← Previous',
    Next = 'Next →',
    First = '←← First',
    Last = 'Last →→',
}

interface HandleInteractionsOptions
{
    customId: string;
    message: Message;
    commandName: CommandName;
    embeds: EmbedBuilder[];
    onSelect: OnSelect;
}

export class PaginatedStringSelectMenu<Element> extends StringSelectMenuBuilder
{
    private MAX_OPTIONS_PER_PAGE = 25;

    private elementName: string;
    private elementOptions: SelectMenuComponentOptionData[];
    private index = 0;

    constructor({
        customId,
        elementName,
        elements,
        optionParser,
        message,
        commandName,
        embeds,
        onSelect,
    }: {
        elementName: string;
        elements: Element[];
        optionParser: (element: Element) => SelectMenuComponentOptionData;
    } & HandleInteractionsOptions)
    {
        const options = elements.map(optionParser);

        super({ customId, placeholder: `${elementName} List - Page 1` });
        this.elementName = elementName;
        this.elementOptions = options;
        this.setPage(PageNavigation.First);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.handleInteractions({
            customId,
            message,
            commandName,
            embeds,
            onSelect,
        });
    }

    private async handleInteractions({
        customId,
        message,
        commandName,
        embeds,
        onSelect,
    }: HandleInteractionsOptions): Promise<void>
    {
        await InteractionStrategy.handleInteractions({
            interactionResponse: message,
            commandName,
            restartStyle: InteractionListenerRestartStyle.OnSuccess,
            onInteraction: /* istanbul ignore next */ async (receivedInteraction) =>
            {
                const { customId: receivedCustomId, values: [value] = [] } = receivedInteraction as StringSelectMenuInteraction;

                if (customId !== receivedCustomId || !value)
                {
                    await onSelect(receivedInteraction as StringSelectMenuInteraction);
                    return;
                }

                const handlerMap: Record<PageNavigation, () => void> = {
                    [PageNavigation.Previous]: () => this.setPage(PageNavigation.Previous),
                    [PageNavigation.Next]: () => this.setPage(PageNavigation.Next),
                    [PageNavigation.First]: () => this.setPage(PageNavigation.First),
                    [PageNavigation.Last]: () => this.setPage(PageNavigation.Last),
                };

                const handler = handlerMap[value as PageNavigation];

                if (handler)
                {
                    handler();
                    await receivedInteraction.update({
                        embeds,
                        components: [this.toActionRowBuilder()],
                    });
                }
                else
                {
                    await onSelect(receivedInteraction as StringSelectMenuInteraction);
                }
            },
            getActionRowComponent: () => this.toActionRowBuilder(),
        });
    }

    private get elementsPerPage(): number
    {
        if (this.numOfPages === 1)
        {
            return this.elementOptions.length;
        }

        if (this.numOfPages === 2)
        {
            return this.MAX_OPTIONS_PER_PAGE - 1;
        }

        return this.MAX_OPTIONS_PER_PAGE - 2;
    }

    private get numOfPages(): number
    {
        if (this.elementOptions.length <= this.MAX_OPTIONS_PER_PAGE)
        {
            return 1;
        }

        if (this.elementOptions.length <= 2 * (this.MAX_OPTIONS_PER_PAGE - 1))
        {
            return 2;
        }

        return Math.ceil(this.elementOptions.length / (this.MAX_OPTIONS_PER_PAGE - 2));
    }

    private get pages(): SelectMenuComponentOptionData[][]
    {
        return chunkArray({
            array: this.elementOptions,
            shouldMoveToNextChunk: (_, index) => (
                index % this.elementsPerPage === 0
                && index !== 0
            ),
        });
    }

    private get curPage(): SelectMenuComponentOptionData[]
    {
        const mainPage = this.pages[this.index];

        if (this.numOfPages !== 1)
        {
            // 2+ pages, not the last page
            if (this.index !== this.numOfPages - 1 && this.numOfPages >= 2)
            {
                mainPage.push({
                    label: PageNavigation.Next,
                    value: PageNavigation.Next,
                    description: `Page ${this.index + 2}`,
                });
            }
            // 2+ pages, not the first page
            if (this.index !== 0 && this.numOfPages >= 2)
            {
                mainPage.unshift({
                    label: PageNavigation.Previous,
                    value: PageNavigation.Previous,
                    description: `Page ${this.index}`,
                });
            }

            // 3+ pages, the first page
            if (this.index === 0 && this.numOfPages >= 3)
            {
                mainPage.unshift({
                    label: PageNavigation.Last,
                    value: PageNavigation.Last,
                    description: `Page ${this.numOfPages}`,
                });
            }
            // 3+ pages, the last page
            else if (this.index === this.numOfPages - 1 && this.numOfPages >= 3)
            {
                mainPage.push({
                    label: PageNavigation.First,
                    value: PageNavigation.First,
                    description: 'Page 1',
                });
            }
        }

        return mainPage;
    }

    public setPage(value: PageNavigation): void
    {
        if (value === PageNavigation.Previous)
        {
            this.index -= 1;
        }
        else if (value === PageNavigation.Next)
        {
            this.index += 1;
        }
        else if (value === PageNavigation.First)
        {
            this.index = 0;
        }
        else if (value === PageNavigation.Last)
        {
            this.index = this.numOfPages - 1;
        }

        this.setOptions(this.curPage);
        this.setPlaceholder(`${this.elementName} List - Page ${this.index + 1}`);
    }

    /* istanbul ignore next */
    private toActionRowBuilder(): ActionRowBuilder<PaginatedStringSelectMenu<Element>>
    {
        return new ActionRowBuilder<PaginatedStringSelectMenu<Element>>({
            components: [this],
        });
    }
}
