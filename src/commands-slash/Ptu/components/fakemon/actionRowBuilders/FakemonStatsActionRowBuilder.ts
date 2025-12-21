import { ActionRowBuilder, type Message } from 'discord.js';

import { CommandName } from '../../../../../types/discord.js';
import { InteractiveStringSelectMenu } from '../../../../shared/components/InteractiveStringSelectMenu.js';
import { PaginatedStringSelectMenu } from '../../../../shared/components/PaginatedStringSelectMenu.js';
import { PtuPokemonForLookupPokemon } from '../../../embed-messages/lookup.js';

interface FakemonStatsActionRowBuilderOptions
{
    message: Message;
    commandName: CommandName;
    stateGuid: string;
}

export enum FakemonStatsCustomIds
{
    Selector = 'selector',
}

export enum FakemonStatsElementOptions
{
    HP = 'HP',
    Attack = 'Attack',
    Defense = 'Defense',
    SpecialAttack = 'Special Attack',
    SpecialDefense = 'Special Defense',
    Speed = 'Speed',
}

export class FakemonStatsActionRowBuilder extends ActionRowBuilder<PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>>
{
    constructor({ message, commandName }: FakemonStatsActionRowBuilderOptions)
    {
        const stringSelectMenu = new InteractiveStringSelectMenu({
            customId: FakemonStatsCustomIds.Selector,
            placeholder: 'Edit Stat',
            elements: Object.values(FakemonStatsElementOptions),
            message,
            commandName,
            onSelectDropdownOption: (_receivedInteraction) =>
            {
                // TODO: Implement
            },
            onSelectOtherOption: (_receivedInteraction) =>
            {
                // TODO: Implement
            },
            optionParser: (option) => ({ label: option, value: option }),
        });

        super({
            components: [
                stringSelectMenu,
            ],
        });
    }
}
