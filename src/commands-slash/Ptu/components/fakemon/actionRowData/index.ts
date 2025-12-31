import { BaseMessageOptions } from 'discord.js';

import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';
import { FakemonBIEditAbilitiesStringSelectActionRowBuilder } from '../actionRowBuilders/basicInformation/FakemonBIEditAbilitiesStringSelectActionRowBuilder.js';
import { FakemonBIEditTypesStringSelectActionRowBuilder } from '../actionRowBuilders/basicInformation/FakemonBIEditTypesStringSelectActionRowBuilder.js';
import { FakemonBreedingInformationEditEggGroupsStringSelectActionRowBuilder } from '../actionRowBuilders/breedingInformation/FakemonBreedingInformationEditEggGroupsStringSelectActionRowBuilder.js';
import { FakemonBreedingInformationEditGenderRatioStringSelectActionRowBuilder } from '../actionRowBuilders/breedingInformation/FakemonBreedingInformationEditGenderRatioStringSelectActionRowBuilder.js';
import { FakemonCapabilitiesEditCapabilitiesStringSelectActionRowBuilder } from '../actionRowBuilders/capabilities/FakemonCapabilitiesEditCapabilitiesStringSelectActionRowBuilder.js';
import { FakemonCapabilitiesEditNaturewalkStringSelectActionRowBuilder } from '../actionRowBuilders/capabilities/FakemonCapabilitiesEditNaturewalkStringSelectActionRowBuilder.js';
import { FakemonCapabilitiesRemoveOtherCapabilitiesStringSelectActionRowBuilder } from '../actionRowBuilders/capabilities/FakemonCapabilitiesRemoveOtherCapabilitiesStringSelectActionRowBuilder.js';
import { FakemonEnvironmentEditDietsStringSelectActionRowBuilder } from '../actionRowBuilders/environment/FakemonEnvironmentEditDietsStringSelectActionRowBuilder.js';
import { FakemonEnvironmentEditHabitatsStringSelectActionRowBuilder } from '../actionRowBuilders/environment/FakemonEnvironmentEditHabitatsStringSelectActionRowBuilder.js';
import { FakemonOverviewActionRowBuilder } from '../actionRowBuilders/FakemonOverviewActionRowBuilder.js';
import { FakemonSIEditSizeStringSelectActionRowBuilder } from '../actionRowBuilders/FakemonSIEditSizeStringSelectActionRowBuilder.js';
import { FakemonStatsEditStringSelectActionRowBuilder } from '../actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { FakemonStatsSwapStringSelectActionRowBuilder } from '../actionRowBuilders/stats/FakemonStatsSwapStringSelectActionRowBuilder.js';

export function getFakemonOverviewComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.Overview),
    ];
}

export function getFakemonStatsComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonStatsEditStringSelectActionRowBuilder(),
        new FakemonStatsSwapStringSelectActionRowBuilder(),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.Stats),
    ];
}

export function getFakemonBasicInformationComponents(
    args: ConstructorParameters<typeof FakemonBIEditTypesStringSelectActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    return [
        new FakemonBIEditTypesStringSelectActionRowBuilder(args),
        new FakemonBIEditAbilitiesStringSelectActionRowBuilder(),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.BasicInformation),
    ];
}

export function getFakemonSizeInformationComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonSIEditSizeStringSelectActionRowBuilder(),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.SizeInformation),
    ];
}

export function getFakemonBreedingInformationComponents(
    args: ConstructorParameters<typeof FakemonBreedingInformationEditEggGroupsStringSelectActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    return [
        new FakemonBreedingInformationEditGenderRatioStringSelectActionRowBuilder(),
        new FakemonBreedingInformationEditEggGroupsStringSelectActionRowBuilder(args),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.BreedingInformation),
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
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.Environment),
    ];
}

export function getFakemonCapabilitiesComponents(
    args: ConstructorParameters<typeof FakemonCapabilitiesEditNaturewalkStringSelectActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    return [
        new FakemonCapabilitiesEditCapabilitiesStringSelectActionRowBuilder(),
        new FakemonCapabilitiesRemoveOtherCapabilitiesStringSelectActionRowBuilder(args),
        new FakemonCapabilitiesEditNaturewalkStringSelectActionRowBuilder(args),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.Capabilities),
    ];
}
