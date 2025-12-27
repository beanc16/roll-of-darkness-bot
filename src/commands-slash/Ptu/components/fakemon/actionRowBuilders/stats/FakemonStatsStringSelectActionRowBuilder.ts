import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { PaginatedStringSelectMenu } from '../../../../../shared/components/PaginatedStringSelectMenu.js';
import { PtuPokemonForLookupPokemon } from '../../../../embed-messages/lookup.js';
import { FakemonTopLevelSelectorCustomIds } from '../../types.js';

export enum FakemonStatsStringSelectElementOptions
{
    HP = 'HP',
    Attack = 'Attack',
    Defense = 'Defense',
    SpecialAttack = 'Special Attack',
    SpecialDefense = 'Special Defense',
    Speed = 'Speed',
}

export class FakemonStatsStringSelectActionRowBuilder extends ActionRowBuilder<PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonTopLevelSelectorCustomIds.Stats,
                    placeholder: 'Edit Stat',
                    options: Object.values(FakemonStatsStringSelectElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
