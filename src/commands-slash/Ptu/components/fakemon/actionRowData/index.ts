import { BaseMessageOptions } from 'discord.js';

import { FakemonOverviewActionRowBuilder } from '../actionRowBuilders/FakemonOverviewActionRowBuilder.js';
import { FakemonStatsEditStringSelectActionRowBuilder } from '../actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { FakemonStatsSwapStringSelectActionRowBuilder } from '../actionRowBuilders/stats/FakemonStatsSwapStringSelectActionRowBuilder.js';
import { FakemonBackToOverviewButtonActionRowBuilder } from '../actionRowBuilders/FakemonBackToOverviewButtonActionRowBuilder.js';

export function getFakemonOverviewComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonOverviewActionRowBuilder(),
    ];
}

export function getFakemonStatsComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonStatsEditStringSelectActionRowBuilder(),
        new FakemonStatsSwapStringSelectActionRowBuilder(),
        new FakemonBackToOverviewButtonActionRowBuilder(),
    ];
}
