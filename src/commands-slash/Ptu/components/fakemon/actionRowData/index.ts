import { ActionRowBuilder, BaseMessageOptions, ButtonBuilder } from 'discord.js';
import { FakemonStatsActionRowBuilder } from '../actionRowBuilders/FakemonStatsActionRowBuilder.js';
import { FakemonBackToOverviewButton } from '../button/FakemonBackToOverviewButton.js';

export function getFakemonStatsComponents(
    args: ConstructorParameters<typeof FakemonStatsActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    return [
        new FakemonStatsActionRowBuilder(args),
        new ActionRowBuilder<ButtonBuilder>({
            components: [
                new FakemonBackToOverviewButton(),
            ],
        }),
    ];
}
