import { BaseMessageOptions } from 'discord.js';

import { FakemonBIEditAbilitiesStringSelectActionRowBuilder } from '../actionRowBuilders/basicInformation/FakemonBIEditAbilitiesStringSelectActionRowBuilder.js';
import { FakemonBIEditTypesStringSelectActionRowBuilder } from '../actionRowBuilders/basicInformation/FakemonBIEditTypesStringSelectActionRowBuilder.js';
import { FakemonBackToOverviewButtonActionRowBuilder } from '../actionRowBuilders/FakemonBackToOverviewButtonActionRowBuilder.js';
import { FakemonOverviewActionRowBuilder } from '../actionRowBuilders/FakemonOverviewActionRowBuilder.js';
import { FakemonStatsEditStringSelectActionRowBuilder } from '../actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { FakemonStatsSwapStringSelectActionRowBuilder } from '../actionRowBuilders/stats/FakemonStatsSwapStringSelectActionRowBuilder.js';
import { FakemonEnvironmentEditDietsStringSelectActionRowBuilder } from '../actionRowBuilders/environment/FakemonEnvironmentEditDietsStringSelectActionRowBuilder.js';
import { FakemonEnvironmentEditHabitatsStringSelectActionRowBuilder } from '../actionRowBuilders/environment/FakemonEnvironmentEditHabitatsStringSelectActionRowBuilder.js';

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

export function getFakemonBasicInformationComponents(
    args: ConstructorParameters<typeof FakemonBIEditTypesStringSelectActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    return [
        new FakemonBIEditTypesStringSelectActionRowBuilder(args),
        new FakemonBIEditAbilitiesStringSelectActionRowBuilder(),
        new FakemonBackToOverviewButtonActionRowBuilder(),
    ];
}

export function getFakemonEnvironmentComponents(
    args: ConstructorParameters<typeof FakemonEnvironmentEditDietsStringSelectActionRowBuilder>[0]
        & ConstructorParameters<typeof FakemonEnvironmentEditHabitatsStringSelectActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    return [
        new FakemonEnvironmentEditDietsStringSelectActionRowBuilder(args),
        new FakemonEnvironmentEditHabitatsStringSelectActionRowBuilder(args),
        new FakemonBackToOverviewButtonActionRowBuilder(),
    ];
}
