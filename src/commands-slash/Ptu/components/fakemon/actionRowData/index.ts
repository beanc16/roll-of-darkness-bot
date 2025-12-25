import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
} from 'discord.js';

import { FakemonOverviewActionRowBuilder } from '../actionRowBuilders/FakemonOverviewActionRowBuilder.js';
import { FakemonStatsActionRowBuilder } from '../actionRowBuilders/FakemonStatsActionRowBuilder.js';
import { FakemonBackToOverviewButton } from '../button/FakemonBackToOverviewButton.js';

export function getFakemonOverviewComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonOverviewActionRowBuilder(),
    ];
}

export function getFakemonStatsComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonStatsActionRowBuilder(),
        new ActionRowBuilder<ButtonBuilder>({
            components: [
                new FakemonBackToOverviewButton(),
            ],
        }),
    ];
}
