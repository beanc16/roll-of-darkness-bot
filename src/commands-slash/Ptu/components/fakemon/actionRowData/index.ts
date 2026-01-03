import { BaseMessageOptions } from 'discord.js';

import { chunkArray } from '../../../../../services/chunkArray/chunkArray.js';
import { PtuFakemonCollection } from '../../../dal/models/PtuFakemonCollection.js';
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
import { FakemonEvolutionsEditEvolutionStringSelectActionRowBuilder } from '../actionRowBuilders/evolutions/FakemonEvolutionsEditEvolutionStringSelectActionRowBuilder.js';
import { FakemonEvolutionsRemoveEvolutionStringSelectActionRowBuilder } from '../actionRowBuilders/evolutions/FakemonEvolutionsRemoveEvolutionStringSelectActionRowBuilder.js';
import { FakemonOverviewActionRowBuilder } from '../actionRowBuilders/FakemonOverviewActionRowBuilder.js';
import { FakemonSIEditSizeStringSelectActionRowBuilder } from '../actionRowBuilders/FakemonSIEditSizeStringSelectActionRowBuilder.js';
import { FakemonSkillsEditStringSelectActionRowBuilder } from '../actionRowBuilders/FakemonSkillsEditStringSelectActionRowBuilder.js';
import { FakemonMovesAddLevelUpMovesButtonActionRowBuilder } from '../actionRowBuilders/moves/FakemonMovesAddLevelUpMovesButtonActionRowBuilder.js';
import { FakemonMovesAddNonLevelUpMovesButtonActionRowBuilder } from '../actionRowBuilders/moves/FakemonMovesAddNonLevelUpMovesButtonActionRowBuilder.js';
import { FakemonMovesEditLevelUpMovesStringSelectActionRowBuilder } from '../actionRowBuilders/moves/FakemonMovesEditLevelUpMovesStringSelectActionRowBuilder.js';
import { FakemonMovesRemoveLevelUpMovesStringSelectActionRowBuilder } from '../actionRowBuilders/moves/FakemonMovesRemoveLevelUpMovesStringSelectActionRowBuilder.js';
import { FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder } from '../actionRowBuilders/moves/FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder.js';
import { FakemonMovesButtonCustomIds, FakemonMovesStringSelectCustomIds } from '../actionRowBuilders/moves/types.js';
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

export function getFakemonEvolutionsComponents(
    args: ConstructorParameters<typeof FakemonEvolutionsEditEvolutionStringSelectActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    return [
        new FakemonEvolutionsEditEvolutionStringSelectActionRowBuilder(args),
        new FakemonEvolutionsRemoveEvolutionStringSelectActionRowBuilder(args),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.Evolutions),
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

export function getFakemonSkillsComponents(): BaseMessageOptions['components']
{
    return [
        new FakemonSkillsEditStringSelectActionRowBuilder(),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.Capabilities),
    ];
}

export function getFakemonLevelUpMovesComponents(
    args: ConstructorParameters<typeof FakemonMovesEditLevelUpMovesStringSelectActionRowBuilder>[0],
): BaseMessageOptions['components']
{
    const pages = chunkArray({
        array: args.moveList.levelUp,
        shouldMoveToNextChunk: (_, index) => index % 25 === 0 && index !== 0,
    });
    if (pages.length > 2)
    {
        throw new Error('Level up moves cannot have more than 2 pages');
    }
    const removeStringSelects = pages.map(page =>
        new FakemonMovesRemoveLevelUpMovesStringSelectActionRowBuilder(page),
    );

    // A max of 5 action row builders can be added, so limit removal string selects to 3
    return [
        new FakemonMovesAddLevelUpMovesButtonActionRowBuilder(),
        new FakemonMovesEditLevelUpMovesStringSelectActionRowBuilder(args),
        ...(removeStringSelects.length > 0
            ? removeStringSelects
            : [
                new FakemonMovesRemoveLevelUpMovesStringSelectActionRowBuilder([]),
            ]),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.LevelUpMoves),
    ];
}

export function getFakemonEggMovesComponents(args: Pick<PtuFakemonCollection, 'moveList'>): BaseMessageOptions['components']
{
    const pages = chunkArray({
        array: args.moveList.eggMoves,
        shouldMoveToNextChunk: (_, index) => index % 25 === 0 && index !== 0,
    });
    if (pages.length > 3)
    {
        throw new Error('Egg moves cannot have more than 3 pages');
    }
    const removeStringSelects = pages.map(page =>
        new FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder(
            FakemonMovesStringSelectCustomIds.RemoveEggMoves,
            page,
        ),
    );

    // A max of 5 action row builders can be added, so limit removal string selects to 3
    return [
        new FakemonMovesAddNonLevelUpMovesButtonActionRowBuilder(FakemonMovesButtonCustomIds.AddEggMoves),
        ...(removeStringSelects.length > 0
            ? removeStringSelects
            : [
                new FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder(
                    FakemonMovesStringSelectCustomIds.RemoveEggMoves,
                    [],
                ),
            ]),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.EggMoves),
    ];
}

export function getFakemonTmHmMovesComponents(args: Pick<PtuFakemonCollection, 'moveList'>): BaseMessageOptions['components']
{
    const pages = chunkArray({
        array: args.moveList.tmHm,
        shouldMoveToNextChunk: (_, index) => index % 25 === 0 && index !== 0,
    });
    if (pages.length > 3)
    {
        throw new Error('Egg moves cannot have more than 3 pages');
    }
    const removeStringSelects = pages.map(page =>
        new FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder(
            FakemonMovesStringSelectCustomIds.RemoveTmHmMoves,
            page,
        ),
    );

    // A max of 5 action row builders can be added, so limit removal string selects to 3
    return [
        new FakemonMovesAddNonLevelUpMovesButtonActionRowBuilder(FakemonMovesButtonCustomIds.AddTmHmMoves),
        ...(removeStringSelects.length > 0
            ? removeStringSelects
            : [
                new FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder(
                    FakemonMovesStringSelectCustomIds.RemoveTmHmMoves,
                    [],
                ),
            ]),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.TmHmMoves),
    ];
}

export function getFakemonTutorMovesComponents(args: Pick<PtuFakemonCollection, 'moveList'>): BaseMessageOptions['components']
{
    const pages = chunkArray({
        array: args.moveList.tutorMoves,
        shouldMoveToNextChunk: (_, index) => index % 25 === 0 && index !== 0,
    });
    if (pages.length > 3)
    {
        throw new Error('Egg moves cannot have more than 3 pages');
    }
    const removeStringSelects = pages.map(page =>
        new FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder(
            FakemonMovesStringSelectCustomIds.RemoveTutorMoves,
            page,
        ),
    );

    // A max of 5 action row builders can be added, so limit removal string selects to 3
    return [
        new FakemonMovesAddNonLevelUpMovesButtonActionRowBuilder(FakemonMovesButtonCustomIds.AddTutorMoves),
        ...(removeStringSelects.length > 0
            ? removeStringSelects
            : [
                new FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder(
                    FakemonMovesStringSelectCustomIds.RemoveTutorMoves,
                    [],
                ),
            ]),
        new FakemonOverviewActionRowBuilder(FakemonInteractionManagerPage.TutorMoves),
    ];
}
