import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from 'discord.js';
import { FakemonStatsStringSelectCustomIds } from './types.js';

export enum FakemonStatsSwapStringSelectElementOptions
{
    AttackStats = 'Attack & S.Attack',
    DefenseStats = 'Defense & S.Defense',
    PhysicalStats = 'Attack & Defense',
    SpecialStats = 'S.Attack & S.Defense',
}

export class FakemonStatsSwapStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonStatsStringSelectCustomIds.SwapStats,
                    placeholder: FakemonStatsStringSelectCustomIds.SwapStats,
                    options: Object.values(FakemonStatsSwapStringSelectElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
