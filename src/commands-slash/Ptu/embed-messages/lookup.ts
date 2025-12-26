import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { MAX_EMBED_DESCRIPTION_LENGTH } from '../../../constants/discord.js';
import { getPagedEmbedBuilders, getPagedEmbedMessages } from '../../shared/embed-messages/shared.js';
import { FakemonBasicInformationEmbedMessage } from '../components/fakemon/embeds/FakemonBasicInformationEmbedMessage.js';
import { FakemonBreedingInformationEmbedMessage } from '../components/fakemon/embeds/FakemonBreedingInformationEmbedMessage.js';
import { FakemonCapabilitiesEmbedMessage } from '../components/fakemon/embeds/FakemonCapabilitiesEmbedMessage.js';
import { FakemonEggMovesEmbedMessage } from '../components/fakemon/embeds/FakemonEggMovesEmbedMessage.js';
import { FakemonEnvironmentEmbedMessage } from '../components/fakemon/embeds/FakemonEnvironmentEmbedMessage.js';
import { FakemonEvolutionsEmbedMessage } from '../components/fakemon/embeds/FakemonEvolutionsEmbedMessage.js';
import { FakemonLevelUpMovesEmbedMessage } from '../components/fakemon/embeds/FakemonLevelUpMovesEmbedMessage.js';
import { FakemonMegaFormEmbedMessage } from '../components/fakemon/embeds/FakemonMegaFormEmbedMessage.js';
import { FakemonSizeInformationEmbedMessage } from '../components/fakemon/embeds/FakemonSizeInformationEmbedMessage.js';
import { FakemonSkillsEmbedMessage } from '../components/fakemon/embeds/FakemonSkillsEmbedMessage.js';
import { FakemonStatsEmbedMessage } from '../components/fakemon/embeds/FakemonStatsEmbedMessage.js';
import { FakemonTmHmMovesEmbedMessage } from '../components/fakemon/embeds/FakemonTmHmMovesEmbedMessage.js';
import { FakemonTutorMovesEmbedMessage } from '../components/fakemon/embeds/FakemonTutorMovesEmbedMessage.js';
import { FakemonZygardeCubeMovesEmbedMessage } from '../components/fakemon/embeds/FakemonZygardeCubeMovesEmbedMessage.js';
import { PtuMove } from '../models/PtuMove.js';
import {
    PtuAbilityListType,
    PtuMoveListType,
    type PtuPokemon,
} from '../types/pokemon.js';

const color = 0xCDCDCD;

export interface PtuPokemonForLookupPokemon extends PtuPokemon
{
    groupedVersions?: {
        versionNames: PtuPokemon['versionName'][];
        pokemon: (PtuPokemon | NonNullable<PtuPokemon['olderVersions']>[0])[];
        type?: PtuMoveListType | PtuAbilityListType;
    }[];
}

interface ParseLookupByPokemonAbilityInputResponse
{
    [PtuAbilityListType.Basic]: string[];
    [PtuAbilityListType.Advanced]: string[];
    [PtuAbilityListType.High]: string[];
}

interface ParseLookupByPokemonMoveInputResponse
{
    [PtuMoveListType.LevelUp]: {
        name: string;
        level: string | number;
    }[];
    [PtuMoveListType.EggMoves]: string[];
    [PtuMoveListType.TmHm]: string[];
    [PtuMoveListType.TutorMoves]: string[];
    [PtuMoveListType.ZygardeCubeMoves]: string[];
    totalLevelUpMoveLearnedValue: 0;
    outliersInLevelUpData: { name: string; level: string | number }[];
}

export const getLookupMovesEmbedMessages = (input: PtuMove[], options: {
    includeContestStats?: boolean;
} = {}): EmbedBuilder[] =>
{
    const output = getPagedEmbedMessages({
        input,
        title: 'Moves',
        parseElementToLines: element => [
            Text.bold(element.name),
            ...(element.type !== undefined ? [`Type: ${element.type}`] : []),
            ...(element.frequency !== undefined ? [`Frequency: ${element.frequency}`] : []),
            ...(element.ac !== undefined ? [`AC: ${element.ac}`] : []),
            ...(element.damageBase !== undefined ? [`DB: ${element.damageBase}`] : []),
            ...(element.category !== undefined ? [`Class: ${element.category}`] : []),
            ...(element.range && element.range !== '--' ? [`Range: ${element.range}`] : []),
            ...(options.includeContestStats && element.contestStatType
                ? [`Contest Type: ${element.contestStatType}`]
                : []
            ),
            ...(options.includeContestStats && element.contestStatEffect
                ? [`Contest Effect: ${element.contestStatEffect}`]
                : []
            ),
            ...(element.basedOn !== undefined ? [`Based On: ${element.basedOn}`] : []),
            ...(element.effects && element.effects !== '--'
                ? [`Effect:\n\`\`\`\n${element.effects}\`\`\``]
                : ['']
            ),
        ],
    });

    return output;
};

export const getLookupPokemonEmbedMessages = (
    pokemon: Omit<PtuPokemon, 'versionName' | 'olderVersions'>[],
    moveNameToMovesRecord: Record<string, PtuMove>,
): EmbedBuilder[] =>
{
    if (pokemon.length === 0) return [];

    const pages = pokemon.reduce<{
        description: string;
        imageUrl?: string;
    }[]>((acc, {
        name,
        baseStats,
        types,
        abilities,
        evolution,
        sizeInformation,
        breedingInformation,
        diets,
        habitats,
        capabilities,
        skills,
        moveList,
        metadata: {
            dexNumber,
            source,
            page,
            imageUrl,
        },
        megaEvolutions,
        extras,
    }) =>
    {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(`${dexNumber !== undefined ? `${dexNumber} ` : ''}${name}`),
            '',
            Text.bold('Base Stats'),
            ...FakemonStatsEmbedMessage.constructDescriptionLines({ baseStats }),
            '',
            Text.bold('Basic Information'),
            ...FakemonBasicInformationEmbedMessage.constructDescriptionLines({ types, abilities }),
            '',
            Text.bold('Evolution'),
            ...FakemonEvolutionsEmbedMessage.constructDescriptionLines({ evolution }),
            '',
            Text.bold('Size Information'),
            ...FakemonSizeInformationEmbedMessage.constructDescriptionLines({ sizeInformation }),
            '',
            Text.bold('Breeding Information'),
            ...FakemonBreedingInformationEmbedMessage.constructDescriptionLines({ breedingInformation }),
            Text.bold('Environment'),
            ...FakemonEnvironmentEmbedMessage.constructDescriptionLines({ diets, habitats }),
            '',
            Text.bold('Capabilities'),
            FakemonCapabilitiesEmbedMessage.constructDescriptionLines({ capabilities }).join(', '),
            '',
            Text.bold('Skills'),
            FakemonSkillsEmbedMessage.constructDescriptionLines({ skills }).join(', '),
            '',
            Text.bold('Level Up Move List'),
            ...FakemonLevelUpMovesEmbedMessage.constructDescriptionLines({ moveList }, moveNameToMovesRecord),
            '',
            ...(moveList.eggMoves.length > 0
                ? [
                    Text.bold('Egg Move List'),
                    FakemonEggMovesEmbedMessage.constructDescription({ moveList }, moveNameToMovesRecord),
                    '',
                ]
                : []
            ),
            ...(moveList.tmHm.length > 0
                ? [
                    Text.bold('TM/HM Move List'),
                    FakemonTmHmMovesEmbedMessage.constructDescription({ moveList }, moveNameToMovesRecord),
                    '',
                ]
                : []
            ),
            ...(moveList.tutorMoves.length > 0
                ? [
                    Text.bold('Tutor Move List'),
                    FakemonTutorMovesEmbedMessage.constructDescription({ moveList }, moveNameToMovesRecord),
                    '',
                ]
                : []
            ),
            ...(moveList.zygardeCubeMoves && moveList.zygardeCubeMoves.length > 0
                ? [
                    Text.bold('Zygarde Cube Move List'),
                    FakemonZygardeCubeMovesEmbedMessage.constructDescription({ moveList }, moveNameToMovesRecord),
                    '',
                ]
                : []
            ),
            (megaEvolutions && megaEvolutions.length > 0
                ? `${Text.bold(`Mega Evolution${megaEvolutions.length > 1 ? 's' : ''}`)}\n`
                + FakemonMegaFormEmbedMessage.constructDescriptionLines({ megaEvolutions }).join('\n')
                : []
            ),
            ...(extras && extras.length > 0
                ? [
                    ...extras.map(({ name: extraName, value }) => `${Text.bold(extraName)}\n${value}`),
                    '',
                ]
                : []
            ),
            [source, page].filter(str => !!str).join(': '),
        ];

        // Add the pokemon's line-by-line description as pages w/ the imageUrl
        const { descriptions } = lines.reduce<{
            descriptions: string[];
            currentPageIndex: number;
        }>((acc2, line) =>
        {
            if (typeof line !== 'string')
            {
                return acc2;
            }

            let currentPage = acc2.descriptions[acc2.currentPageIndex];

            // If no current page or adding the line exceeds the limit, create a new page
            if (
                !currentPage
                || currentPage.length + line.length + 1 > MAX_EMBED_DESCRIPTION_LENGTH
            )
            {
                acc2.currentPageIndex += 1;
                currentPage = '';
            }

            // Add the line to the current page description
            const previousDescription = acc2.descriptions[acc2.currentPageIndex] ?? '';
            acc2.descriptions[acc2.currentPageIndex] = previousDescription + (currentPage ? '\n' : '') + line;

            return acc2;
        }, {
            descriptions: [],
            currentPageIndex: 0,
        });

        // Add the pokemon's line-by-line description as a page w/ the imageUrl
        descriptions.forEach((description) =>
        {
            acc.push({
                description,
                imageUrl,
            });
        });

        return acc;
    }, []);

    return pages.map(({ description, imageUrl }, index) =>
    {
        const embed = new EmbedBuilder()
            .setTitle('Pokemon')
            .setDescription(description)
            .setColor(color);

        if (pages.length > 1)
        {
            embed.setFooter({ text: `Page ${index + 1}/${pages.length}` });
        }

        if (imageUrl)
        {
            embed.setImage(imageUrl);
        }

        return embed;
    });
};

const parseLookupByPokemonMoveInput = ({
    acc,
    moveList,
    curPokemonName,
    moveName,
    moveListType,
    groupedVersionType,
}: {
    acc: ParseLookupByPokemonMoveInputResponse;
    moveList: PtuPokemonForLookupPokemon['moveList'];
    curPokemonName: PtuPokemonForLookupPokemon['name'];
    moveName: string;
    moveListType: PtuMoveListType;
    groupedVersionType?: PtuMoveListType;
}): ParseLookupByPokemonMoveInputResponse =>
{
    if (
        (moveListType === PtuMoveListType.LevelUp && !(moveList.levelUp ?? []).find(({ move }) => move === moveName) && groupedVersionType !== PtuMoveListType.LevelUp)
        || (moveListType === PtuMoveListType.TmHm && !(moveList.tmHm ?? []).find(move => move.toLowerCase().includes(moveName.toLowerCase())) && groupedVersionType !== PtuMoveListType.TmHm)
        || (moveListType === PtuMoveListType.EggMoves && !(moveList.eggMoves ?? []).find(move => move === moveName) && groupedVersionType !== PtuMoveListType.EggMoves)
        || (moveListType === PtuMoveListType.TutorMoves && !(moveList.tutorMoves ?? []).find(move => move === moveName) && groupedVersionType !== PtuMoveListType.TutorMoves)
        || (((moveListType === PtuMoveListType.ZygardeCubeMoves && !moveList.zygardeCubeMoves) || (moveList.zygardeCubeMoves && !moveList.zygardeCubeMoves.find(move => move === moveName))) && groupedVersionType !== PtuMoveListType.ZygardeCubeMoves)
    )
    {
        return acc;
    }

    if (
        (
            moveListType === PtuMoveListType.EggMoves
            || moveListType === PtuMoveListType.TmHm
            || moveListType === PtuMoveListType.TutorMoves
            || moveListType === PtuMoveListType.ZygardeCubeMoves
        ) && (!groupedVersionType || groupedVersionType === moveListType)
    )
    {
        acc[moveListType].push(curPokemonName);
        return acc;
    }

    const zygardeMove = (moveList?.zygardeCubeMoves ?? []).find(move => move === moveName);
    if (zygardeMove && moveListType === PtuMoveListType.All && (!groupedVersionType || groupedVersionType === PtuMoveListType.ZygardeCubeMoves))
    {
        acc[PtuMoveListType.ZygardeCubeMoves].push(curPokemonName);
        return acc;
    }

    const eggMove = (moveList.eggMoves ?? []).find(move => move === moveName);
    if (eggMove && moveListType === PtuMoveListType.All && (!groupedVersionType || groupedVersionType === PtuMoveListType.EggMoves))
    {
        acc[PtuMoveListType.EggMoves].push(curPokemonName);
        return acc;
    }

    const tutorMove = (moveList.tutorMoves ?? []).find(move => move === moveName);
    if (tutorMove && moveListType === PtuMoveListType.All && (!groupedVersionType || groupedVersionType === PtuMoveListType.TutorMoves))
    {
        acc[PtuMoveListType.TutorMoves].push(curPokemonName);
        // Don't return acc
    }

    const tmHmMove = (moveList.tmHm ?? []).find(move => move.toLowerCase().includes(moveName.toLowerCase()));
    if (tmHmMove && moveListType === PtuMoveListType.All && (!groupedVersionType || groupedVersionType === PtuMoveListType.TmHm))
    {
        acc[PtuMoveListType.TmHm].push(curPokemonName);
        // Don't return acc
    }

    const levelUpMove = (moveList.levelUp ?? []).find(({ move }) => move === moveName);
    if (
        (moveListType === PtuMoveListType.LevelUp || moveListType === PtuMoveListType.All)
        && levelUpMove
        && (!groupedVersionType || groupedVersionType === PtuMoveListType.LevelUp)
    )
    {
        const level = parseInt(levelUpMove.level as string, 10);

        if (!Number.isNaN(level))
        {
            acc.totalLevelUpMoveLearnedValue += level;
            acc[PtuMoveListType.LevelUp].push({
                name: curPokemonName,
                level: (!Number.isNaN(level))
                    ? levelUpMove.level
                    : level,
            });
        }
        else
        {
            acc.outliersInLevelUpData.push({
                name: curPokemonName,
                level: levelUpMove.level,
            });
        }
    }

    return acc;
};

export const getLookupPokemonByMoveEmbedMessages = (pokemon: PtuPokemonForLookupPokemon[], { moveName, moveListType }: {
    moveName: string;
    moveListType: PtuMoveListType;
}): EmbedBuilder[] =>
{
    if (pokemon.length === 0) return [];

    const {
        levelUp: pokemonWithlevelUp,
        eggMoves: pokemonWithEggMoves,
        tmHm: pokemonWithTmHm,
        tutorMoves: pokemonWithTutorMoves,
        zygardeCubeMoves: pokemonWithZygardeCubeMoves,
        outliersInLevelUpData: pokemonOutliersInLevelUpData,
        totalLevelUpMoveLearnedValue,
    } = pokemon.reduce<ParseLookupByPokemonMoveInputResponse>((acc, curPokemon) =>
    {
        const {
            name,
            moveList,
            groupedVersions,
        } = curPokemon;

        if (groupedVersions && groupedVersions.length > 0)
        {
            groupedVersions.forEach(({
                versionNames,
                pokemon: [{ moveList: curMoveList }],
                type: groupedVersionType,
            }) =>
            {
                parseLookupByPokemonMoveInput({
                    acc,
                    moveList: curMoveList,
                    curPokemonName: `${name} [${versionNames.join(', ')}]`,
                    moveName,
                    moveListType,
                    groupedVersionType: groupedVersionType as PtuMoveListType,
                });
            });

            return acc;
        }

        return parseLookupByPokemonMoveInput({
            acc,
            moveList,
            curPokemonName: name,
            moveName,
            moveListType,
        });
    }, {
        [PtuMoveListType.LevelUp]: [],
        [PtuMoveListType.EggMoves]: [],
        [PtuMoveListType.TmHm]: [],
        [PtuMoveListType.TutorMoves]: [],
        [PtuMoveListType.ZygardeCubeMoves]: [],
        totalLevelUpMoveLearnedValue: 0,
        outliersInLevelUpData: [],
    });

    // Sort level up move results by their level
    pokemonWithlevelUp.sort((a, b) =>
    {
        const aLevel = parseInt(a.level as string, 10);
        if (Number.isNaN(aLevel))
        {
            return 1;
        }

        const bLevel = parseInt(b.level as string, 10);
        if (Number.isNaN(bLevel))
        {
            return -1;
        }

        return aLevel - bLevel;
    });

    const moveListTypeToEndOfTitle: Record<PtuMoveListType, string> = {
        [PtuMoveListType.All]: '',
        [PtuMoveListType.LevelUp]: ' as a Level-Up Move',
        [PtuMoveListType.EggMoves]: ' as an Egg Move',
        [PtuMoveListType.TmHm]: ' as a TM/HM',
        [PtuMoveListType.TutorMoves]: ' as a Tutor Move',
        [PtuMoveListType.ZygardeCubeMoves]: ' as a Zygarde Cube Move',
    };
    let description = `${Text.bold(`Pokemon that can learn ${moveName}${moveListTypeToEndOfTitle[moveListType]}`)}\n`;

    // Level Up
    if (pokemonWithlevelUp.length > 0 || pokemonOutliersInLevelUpData.length > 0)
    {
        if (description.length > 0) description += '\n';
        description += Text.bold('Learn as Level-Up Move:') + '\n';
        description += `${
            ((totalLevelUpMoveLearnedValue / pokemonWithlevelUp.length) || 0).toFixed(1)
        } Average Level\n`;

        description = pokemonOutliersInLevelUpData.reduce(
            (acc, { level, name }) => acc + `${level} ${name}\n`,
            description,
        );

        description = pokemonWithlevelUp.reduce(
            (acc, { level, name }) => (
                acc + `${level} ${name}\n`
            ),
            description,
        );
    }

    // Egg Move
    if (pokemonWithEggMoves.length > 0)
    {
        description = pokemonWithEggMoves.reduce(
            (acc, name) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Egg Move:')}\n`,
        );
    }

    // TM/HM
    if (pokemonWithTmHm.length > 0)
    {
        description = pokemonWithTmHm.reduce(
            (acc, name) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as TM/HM:')}\n`,
        );
    }

    // Tutor Move
    if (pokemonWithTutorMoves.length > 0)
    {
        description = pokemonWithTutorMoves.reduce(
            (acc, name) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Tutor Move:')}\n`,
        );
    }

    // Zygarde Cube Move
    if (pokemonWithZygardeCubeMoves.length > 0)
    {
        description = pokemonWithZygardeCubeMoves.reduce(
            (acc, name) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Zygarde Cube Move:')}\n`,
        );
    }

    const lines = description.split('\n');
    const { pages } = lines.reduce((acc, line) =>
    {
        if (acc.pages[acc.curPageIndex].length + line.length >= MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPageIndex += 1;
        }

        acc.pages[acc.curPageIndex] += `${line}\n`;

        return acc;
    }, {
        pages: [''] as string[],
        curPageIndex: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Pokemon',
        pages,
    });
};

const parseLookupByPokemonAbilityInput = ({
    acc,
    abilities,
    curPokemonName,
    abilityName,
    abilityListType,
    groupedVersionType,
}: {
    acc: ParseLookupByPokemonAbilityInputResponse;
    abilities: PtuPokemonForLookupPokemon['abilities'];
    curPokemonName: string;
    abilityName: string;
    abilityListType: PtuAbilityListType;
    groupedVersionType?: PtuAbilityListType;
}): ParseLookupByPokemonAbilityInputResponse =>
{
    if (
        abilityListType !== PtuAbilityListType.All
        && (!groupedVersionType || groupedVersionType === abilityListType)
    )
    {
        acc[abilityListType].push(curPokemonName);
        return acc;
    }

    const basicAbility = (abilities.basicAbilities ?? []).find(ability => ability === abilityName);
    if (basicAbility && (!groupedVersionType || groupedVersionType === PtuAbilityListType.Basic))
    {
        acc[PtuAbilityListType.Basic].push(curPokemonName);
        return acc;
    }

    const advancedAbility = (abilities.advancedAbilities ?? []).find(ability => ability === abilityName);
    if (advancedAbility && (!groupedVersionType || groupedVersionType === PtuAbilityListType.Advanced))
    {
        acc[PtuAbilityListType.Advanced].push(curPokemonName);
        return acc;
    }

    if (abilities.highAbility === abilityName && (!groupedVersionType || groupedVersionType === PtuAbilityListType.High))
    {
        acc[PtuAbilityListType.High].push(curPokemonName);
        return acc;
    }

    return acc;
};

export const getLookupPokemonByAbilityEmbedMessages = (pokemon: PtuPokemonForLookupPokemon[], { abilityName, abilityListType }: {
    abilityName: string;
    abilityListType: PtuAbilityListType;
}): EmbedBuilder[] =>
{
    if (pokemon.length === 0) return [];

    const {
        basicAbilities: pokemonWithBasic,
        advancedAbilities: pokemonWithAdvanced,
        highAbility: pokemonWithHigh,
    } = pokemon.reduce((acc, curPokemon) =>
    {
        const {
            name,
            abilities,
            groupedVersions,
        } = curPokemon;

        if (groupedVersions && groupedVersions.length > 0)
        {
            groupedVersions.forEach(({
                versionNames,
                pokemon: [{ abilities: curAbilities }],
                type: groupedVersionType,
            }) =>
            {
                parseLookupByPokemonAbilityInput({
                    acc,
                    abilities: curAbilities,
                    curPokemonName: `${name} [${versionNames.join(', ')}]`,
                    abilityName,
                    abilityListType,
                    groupedVersionType: groupedVersionType as PtuAbilityListType,
                });
            });

            return acc;
        }

        return parseLookupByPokemonAbilityInput({
            acc,
            abilities,
            curPokemonName: name,
            abilityName,
            abilityListType,
        });
    }, {
        [PtuAbilityListType.Basic]: [] as string[],
        [PtuAbilityListType.Advanced]: [] as string[],
        [PtuAbilityListType.High]: [] as string[],
    });

    const abilityListTypeToEndOfTitle: Record<PtuAbilityListType, string> = {
        [PtuAbilityListType.All]: '',
        [PtuAbilityListType.Basic]: ' as a Basic Ability',
        [PtuAbilityListType.Advanced]: ' as an Advanced Ability',
        [PtuAbilityListType.High]: ' as a High Ability',
    };
    let description = `${Text.bold(`Pokemon that can learn ${abilityName}${abilityListTypeToEndOfTitle[abilityListType]}`)}\n`;

    // Basic Ability
    if (pokemonWithBasic.length > 0)
    {
        description = pokemonWithBasic.reduce(
            (acc, name) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Basic Ability:')}\n`,
        );
    }

    // Advanced Ability
    if (pokemonWithAdvanced.length > 0)
    {
        description = pokemonWithAdvanced.reduce(
            (acc, name) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Advanced Ability:')}\n`,
        );
    }

    // Tutor Move
    if (pokemonWithHigh.length > 0)
    {
        description = pokemonWithHigh.reduce(
            (acc, name) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as High Ability:')}\n`,
        );
    }

    const lines = description.split('\n');
    const { pages } = lines.reduce((acc, line) =>
    {
        if (acc.pages[acc.curPageIndex].length + line.length >= MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPageIndex += 1;
        }

        acc.pages[acc.curPageIndex] += `${line}\n`;

        return acc;
    }, {
        pages: [''] as string[],
        curPageIndex: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Pokemon',
        pages,
    });
};

export const getLookupPokemonByCapabilityEmbedMessages = (pokemon: PtuPokemonForLookupPokemon[], { capabilityName }: {
    capabilityName: string;
}): EmbedBuilder[] =>
{
    const lines = pokemon.reduce<string[]>((acc, { name, groupedVersions }) =>
    {
        if (groupedVersions && groupedVersions.length > 0)
        {
            groupedVersions.forEach(({ versionNames }) =>
            {
                acc.push(`${name} [${versionNames.join(', ')}]`);
            });
        }
        else
        {
            acc.push(name);
        }

        return acc;
    }, []);

    const { pages } = lines.reduce((acc, line) =>
    {
        if (acc.pages[acc.curPageIndex].length + line.length >= MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPageIndex += 1;
        }

        acc.pages[acc.curPageIndex] += `${line}\n`;

        return acc;
    }, {
        pages: [
            `${Text.bold(`Pokemon that have the ${capabilityName} Capability`)}\n\n`,
        ],
        curPageIndex: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Pokemon',
        pages,
    });
};

export const getLookupPokemonByEggGroupsEmbedMessages = (pokemon: PtuPokemonForLookupPokemon[], { eggGroups }: {
    eggGroups: string[];
}): EmbedBuilder[] =>
{
    const lines = pokemon.reduce<string[]>((acc, { name, groupedVersions }) =>
    {
        if (groupedVersions && groupedVersions.length > 0)
        {
            groupedVersions.forEach(({ versionNames }) =>
            {
                acc.push(`${name} [${versionNames.join(', ')}]`);
            });
        }
        else
        {
            acc.push(name);
        }

        return acc;
    }, []);

    const { pages } = lines.reduce((acc, line) =>
    {
        if (acc.pages[acc.curPageIndex].length + line.length >= MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPageIndex += 1;
        }

        acc.pages[acc.curPageIndex] += `${line}\n`;

        return acc;
    }, {
        pages: [
            `${Text.bold(`Pokemon that have the ${eggGroups.join(' & ')} Egg Group${eggGroups.length > 1 ? 's' : ''}`)}\n\n`,
        ],
        curPageIndex: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Pokemon',
        pages,
    });
};

export const getLookupPokemonByBstEmbedMessages = (pokemon: PtuPokemonForLookupPokemon[], { baseStatTotal }: {
    baseStatTotal: number;
}): EmbedBuilder[] =>
{
    const lines = pokemon.reduce<string[]>((acc, { name, groupedVersions }) =>
    {
        if (groupedVersions && groupedVersions.length > 0)
        {
            groupedVersions.forEach(({ versionNames }) =>
            {
                acc.push(`${name} [${versionNames.join(', ')}]`);
            });
        }
        else
        {
            acc.push(name);
        }

        return acc;
    }, []);

    const { pages } = lines.reduce((acc, line) =>
    {
        if (acc.pages[acc.curPageIndex].length + line.length >= MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPageIndex += 1;
        }

        acc.pages[acc.curPageIndex] += `${line}\n`;

        return acc;
    }, {
        pages: [
            `${Text.bold(`Pokemon that have a Base Stat Total of ${baseStatTotal}`)}\n\n`,
        ],
        curPageIndex: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Pokemon',
        pages,
    });
};
