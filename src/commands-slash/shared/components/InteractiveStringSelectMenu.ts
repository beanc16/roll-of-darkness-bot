import {
    ActionRowBuilder,
    SelectMenuComponentOptionData,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { InteractionListenerRestartStyle, InteractionStrategy } from '../../strategies/InteractionStrategy/InteractionStrategy.js';
import type { HandleInteractionsOptions as PaginatedHandleInteractionsOptions, PaginatedStringSelectMenuOnSelect } from './PaginatedStringSelectMenu.js';

interface PaginatedStringSelectMenuOptions<Element> extends Omit<HandleInteractionsOptions, 'onSelect'>
{
    elements: Element[];
    optionParser: OptionParser<Element>;
    placeholder: string;
    onSelectDropdownOption: PaginatedStringSelectMenuOnSelect;
    onSelectOtherOption: PaginatedStringSelectMenuOnSelect;
}

interface HandleInteractionsOptions extends Omit<PaginatedHandleInteractionsOptions, 'onSelect'>
{
    onSelectDropdownOption: PaginatedStringSelectMenuOnSelect;
    onSelectOtherOption: PaginatedStringSelectMenuOnSelect;
}

type OptionParser<Element> = (element: Element) => SelectMenuComponentOptionData;

export class InteractiveStringSelectMenu<Element = string> extends StringSelectMenuBuilder
{
    constructor({
        customId,
        placeholder,
        elements,
        optionParser,
        message,
        commandName,
        onSelectDropdownOption,
        onSelectOtherOption,
        rowsBelowStringSelect,
    }: PaginatedStringSelectMenuOptions<Element>)
    {
        super({ customId, placeholder, options: elements.map(optionParser) });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.handleInteractions({
            customId,
            message,
            commandName,
            onSelectDropdownOption,
            onSelectOtherOption,
            rowsBelowStringSelect,
        });
    }

    private async handleInteractions({
        customId,
        message,
        commandName,
        onSelectDropdownOption,
        onSelectOtherOption,
    }: HandleInteractionsOptions): Promise<void>
    {
        await InteractionStrategy.handleInteractions({
            interactionResponse: message,
            commandName,
            restartStyle: InteractionListenerRestartStyle.OnSuccess,
            onInteraction: /* istanbul ignore next */ async (receivedInteraction) =>
            {
                const { customId: receivedCustomId, values: [value] = [] } = receivedInteraction as StringSelectMenuInteraction;

                // Is this string select menu
                if (customId === receivedCustomId && value)
                {
                    await onSelectDropdownOption(receivedInteraction as StringSelectMenuInteraction);
                    return;
                }

                // Is not this string select menu
                await onSelectOtherOption(receivedInteraction as StringSelectMenuInteraction);
            },
            getActionRowComponent: () => this.toActionRowBuilder(),
        });
    }

    /* istanbul ignore next */
    private toActionRowBuilder(): ActionRowBuilder<InteractiveStringSelectMenu<Element>>
    {
        return new ActionRowBuilder<InteractiveStringSelectMenu<Element>>({
            components: [this],
        });
    }
}
