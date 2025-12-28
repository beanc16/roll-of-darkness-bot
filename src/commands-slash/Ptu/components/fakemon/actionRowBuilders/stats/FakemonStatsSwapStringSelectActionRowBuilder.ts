import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from 'discord.js';
import { FakemonStatsStringSelectCustomIds } from './types.js';

export enum FakemonStatsSwapStringSelectElementOptions
{
    SwapAttackStats = 'Attack Stats',
    SwapDefenseStats = 'Defense Stats',
}

export class FakemonStatsSwapStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonStatsStringSelectCustomIds.SwapStats,
                    placeholder: 'Swap Stats',
                    options: Object.values(FakemonStatsSwapStringSelectElementOptions)
                        .map(option => ({ label: option, value: option, emoji: '🔁' })),
                }),
            ],
        });
    }
}
