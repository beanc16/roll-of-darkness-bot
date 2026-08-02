import {
    ActionRowBuilder,
    type Message,
    type StringSelectMenuInteraction,
} from 'discord.js';

import { CommandName } from '../../../../types/discord.js';
import { type HandleInteractionsOptions, PaginatedStringSelectMenu } from '../../../shared/components/PaginatedStringSelectMenu.js';
import { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { HangmonState } from '../../types/hangmon.js';
import { HangmonEmbedMessage } from './HangmonEmbedMessage.js';

interface HangmonActionRowBuilderOptions
{
    message: Message;
    commandName: CommandName;
    embed: HangmonEmbedMessage;
    state: HangmonState;
    onSelect: (
        receivedInteraction: StringSelectMenuInteraction,
        actionRowBuilder: HangmonActionRowBuilder,
    ) => Promise<void>;
    rowsBelowStringSelect: HandleInteractionsOptions['rowsBelowStringSelect'];
}

export enum HangmonCustomIds
{
    PokemonSelector = 'Pokemon',
    GuessHistory = 'Guess History',
}

export class HangmonActionRowBuilder extends ActionRowBuilder<PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>>
{
    private stringSelectMenu: PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>;

    constructor({
        message,
        commandName,
        embed,
        state,
        onSelect,
        rowsBelowStringSelect,
    }: HangmonActionRowBuilderOptions)
    {
        const stringSelectMenu = new PaginatedStringSelectMenu({
            customId: HangmonCustomIds.PokemonSelector,
            elementName: HangmonCustomIds.PokemonSelector,
            elements: state.remainingPokemonOptions,
            message,
            commandName,
            embeds: [embed],
            rowsBelowStringSelect,
            onSelect: (receivedInteraction) => onSelect(receivedInteraction, this),
            optionParser: (curPokemon) =>
            {
                const typesLabel = (curPokemon.types.length > 1)
                    ? 'Types'
                    : 'Type';

                return {
                    label: curPokemon.name,
                    value: curPokemon.name,
                    description: [
                        `${typesLabel}: ${curPokemon.types.join(' / ')}`,
                        `${curPokemon.metadata.source}`,
                    ].join(' | '),
                };
            },
        });

        super({
            components: [
                stringSelectMenu,
            ],
        });

        this.stringSelectMenu = stringSelectMenu;
    }

    public update({ embed, state }: Pick<HangmonActionRowBuilderOptions, 'embed' | 'state'>): void
    {
        this.stringSelectMenu.update({
            embeds: [embed],
            elements: state.remainingPokemonOptions,
        });
    }
}
