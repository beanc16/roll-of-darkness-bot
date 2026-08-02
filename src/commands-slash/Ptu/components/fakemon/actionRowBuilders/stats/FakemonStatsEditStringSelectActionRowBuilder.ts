import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { FakemonStatsStringSelectCustomIds } from './types.js';

export enum FakemonStatsEditStringSelectElementOptions
{
    HP = 'HP',
    Attack = 'Attack',
    Defense = 'Defense',
    SpecialAttack = 'Special Attack',
    SpecialDefense = 'Special Defense',
    Speed = 'Speed',
}

export class FakemonStatsEditStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonStatsStringSelectCustomIds.EditStat,
                    placeholder: FakemonStatsStringSelectCustomIds.EditStat,
                    options: Object.values(FakemonStatsEditStringSelectElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
