import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { PaginatedStringSelectMenu } from '../../../../shared/components/PaginatedStringSelectMenu.js';
import { PtuPokemonForLookupPokemon } from '../../../embed-messages/lookup.js';
import { FakemonSelectorCustomIds } from '../types.js';

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
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonSelectorCustomIds.Stats,
                    placeholder: 'Edit Stat',
                    options: Object.values(FakemonStatsElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
