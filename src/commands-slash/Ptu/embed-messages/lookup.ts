import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { PtuAbility } from '../models/PtuAbility.js';
import { PtuCapability } from '../types/PtuCapability.js';
import { PtuMove } from '../models/PtuMove.js';
import { PtuNature } from '../types/PtuNature.js';
import { PtuTm } from '../types/PtuTm.js';
import { PtuAbilityListType, PtuMoveListType, PtuPokemon } from '../types/pokemon.js';
import { PtuStatus } from '../types/PtuStatus.js';
import { PtuEdge } from '../types/PtuEdge.js';
import { PtuFeature } from '../types/PtuFeature.js';
import { getPagedEmbedBuilders, type TableColumn } from '../../embed-messages/shared.js';
import { MAX_EMBED_DESCRIPTION_LENGTH } from '../../../constants/discord.js';
import { PtuKeyword } from '../types/PtuKeyword.js';

const color = 0xCDCDCD;

export const getLookupAbilitiesEmbedMessages = (abilities: PtuAbility[]) =>
{
    if (abilities.length === 0) return [];

    const { pages } = abilities.reduce((acc, {
        name,
        frequency,
        effect2,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            ...(frequency !== undefined ? [`Frequency: ${frequency}`] : []),
            ...(effect2 && effect2 !== '--' ? [`Effect:\n\`\`\`\n${effect2}\`\`\``] : ['']),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate moves with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the move to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last move
        if (index === abilities.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Abilities',
        pages,
    });
};

export const getLookupCapabilitiesEmbedMessages = (capabilities: PtuCapability[]) =>
{
    if (capabilities.length === 0) return [];

    const { pages } = capabilities.reduce((acc, {
        name,
        description,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            ...(description !== undefined && description !== '--' ? [
                `Description:\n\`\`\`\n${description}\`\`\``
            ] : []),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate moves with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the move to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === capabilities.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Capabilities',
        pages,
    });
};

export const getLookupEdgesEmbedMessages = (edges: PtuEdge[]) =>
{
    if (edges.length === 0) return [];

    const { pages } = edges.reduce((acc, {
        name,
        prerequisites,
        effect,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            ...(prerequisites !== undefined && prerequisites !== '-' ? [
                `Prerequisites: ${prerequisites}`
            ] : []),
            ...(effect !== undefined && effect !== '--' ? [
                `Effect:\n\`\`\`\n${effect}\`\`\``
            ] : []),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate moves with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the move to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === edges.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Edges',
        pages,
    });
};

export const getLookupFeaturesEmbedMessages = (features: PtuFeature[]) =>
{
    if (features.length === 0) return [];

    const { pages } = features.reduce((acc, {
        name,
        tags,
        prerequisites,
        frequencyAndAction,
        effect,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            ...(tags !== undefined && tags !== '-' ? [
                `Tags: ${tags}`
            ] : []),
            ...(prerequisites !== undefined && prerequisites !== '-' ? [
                `Prerequisites: ${prerequisites}`
            ] : []),
            ...(frequencyAndAction !== undefined && frequencyAndAction !== '-' ? [
                `Frequency / Action: ${frequencyAndAction}`
            ] : []),
            ...(effect !== undefined && effect !== '--' ? [
                `Effect:\n\`\`\`\n${effect}\`\`\``
            ] : []),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate moves with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the move to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === features.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Features',
        pages,
    });
};

export const getLookupKeywordsEmbedMessages = (keywords: PtuKeyword[]) =>
{
    if (keywords.length === 0) return [];

    const { pages, tableColumns } = keywords.reduce<{
        pages: string[];
        tableColumns: TableColumn[];
        curPage: number;
    }>((acc, {
        name,
        description,
        tableData,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            ...(description !== undefined && description !== '--' ? [
                `Description:\n\`\`\`\n${description}\`\`\``
            ] : []),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate moves with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the move to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === keywords.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        if (tableData !== undefined && tableData !== '--' && tableData.length > 0)
        {
            const columns = tableData.split('\n');

            columns.forEach(column =>
            {
                const [header, ...rows] = column.split('|');

                acc.tableColumns.push({
                    header,
                    rows,
                });
            });
        }

        return acc;
    }, {
        pages: [''],
        tableColumns: [],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Keywords',
        pages,
        tableColumns,
    });
};

export const getLookupMovesEmbedMessages = (moves: PtuMove[]) =>
{
    if (moves.length === 0) return [];

    const { pages } = moves.reduce((acc, {
        name,
        type,
        category,
        frequency,
        damageBase,
        ac,
        range,
        effects,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            ...(type !== undefined ? [`Type: ${type}`] : []),
            ...(frequency !== undefined ? [`Frequency: ${frequency}`] : []),
            ...(ac !== undefined ? [`AC: ${ac}`] : []),
            ...(damageBase !== undefined ? [`DB: ${damageBase}`] : []),
            ...(category !== undefined ? [`Class: ${category}`] : []),
            ...(range && range !== '--' ? [`Range: ${range}`] : []),
            ...(effects && effects !== '--' ? [`Effect:\n\`\`\`\n${effects}\`\`\``] : ['']),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate moves with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the move to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last move
        if (index === moves.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Moves',
        pages,
    });
};

export const getLookupPokemonEmbedMessages = (pokemon: PtuPokemon[]) =>
{
    if (pokemon.length === 0) return [];

    const pages = pokemon.reduce<{
        description: string;
        imageUrl?: string;
    }[]>((acc, {
        name,
        baseStats,
        types,
        abilities: {
            basicAbilities,
            advancedAbilities,
            highAbility,
        },
        evolution,
        sizeInformation: {
            height,
            weight,
        },
        breedingInformation: {
            genderRatio,
            eggGroups,
            averageHatchRate,
        },
        diets,
        habitats,
        capabilities,
        skills,
        moveList: {
            levelUp,
            eggMoves,
            tmHm,
            tutorMoves,
            zygardeCubeMoves,
        },
        metadata: {
            dexNumber,
            source,
            page,
            imageUrl,
        },
        megaEvolutions,
        extras,
    }) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(`${dexNumber !== undefined ? `${dexNumber} ` : ''}${name}`),
            '',
            Text.bold('Base Stats'),
            `HP: ${baseStats.hp}`,
            `Attack: ${baseStats.attack}`,
            `Defense: ${baseStats.defense}`,
            `Special Attack: ${baseStats.specialAttack}`,
            `Special Defense: ${baseStats.specialDefense}`,
            `Speed: ${baseStats.speed}`,
            `Total: ${Object.values(baseStats).reduce((acc, val) => acc + val, 0)}`,
            '',
            Text.bold('Basic Information'),
            `Type${types.length > 1 ? 's' : ''}: ${types.join('/')}`,
            ...basicAbilities.map((ability, index) => `Basic Ability: ${index + 1}: ${ability}`),
            ...advancedAbilities.map((ability, index) => `Advanced Ability: ${index + 1}: ${ability}`),
            `High Ability: ${highAbility}`,
            '',
            Text.bold('Evolution'),
            ...evolution.sort((a, b) => a.stage - b.stage).map(({ name, level, stage }) => {
                const minimumLevelString = (stage >= 2 && level > 1)
                    ? ` Minimum ${level}`
                    : ''; // Don't include minimum level for 2+ stage evolutions that're level 1. They probably evolve with an evolution stone, which is included in the name.

                return `${stage} - ${name}${minimumLevelString}`;
            }),
            '',
            Text.bold('Size Information'),
            `Height: ${height.freedom} / ${height.metric} (${height.ptu})`,
            `Weight: ${weight.freedom} / ${weight.metric} (${weight.ptu})`,
            '',
            Text.bold('Breeding Information'),
            `Gender Ratio: ${!genderRatio.none ? `${genderRatio.male}% M / ${genderRatio.female}% F` : 'No Gender'}`,
            `Egg Group${eggGroups.length > 1 ? 's' : ''}: ${eggGroups.join(' / ')}`,
            ...(averageHatchRate ? [`Average Hatch Rate: ${averageHatchRate}`, ''] : ['']),
            Text.bold('Environment'),
            `Diet: ${diets.join(', ')}`,
            `Habitat${habitats.length > 1 ? 's' : ''}: ${habitats.join(', ')}`,
            '',
            Text.bold('Capabilities'),
            [ // String
                `Overland: ${capabilities.overland}`,
                ...(capabilities.swim !== undefined ? [`Swim: ${capabilities.swim}`] : []),
                ...(capabilities.sky !== undefined ? [`Sky: ${capabilities.sky}`] : []),
                `Jump: ${capabilities.highJump}/${capabilities.lowJump}`,
                `Power: ${capabilities.power}`,
                ...(capabilities.other ?? []),
            ].join(', '),
            '',
            Text.bold('Skills'),
            [ // String
                `Acro: ${skills.acrobatics}`,
                `Athl: ${skills.athletics}`,
                `Combat: ${skills.combat}`,
                `Focus: ${skills.focus}`,
                `Percep: ${skills.perception}`,
                `Stealth: ${skills.stealth}`,
            ].join(', '),
            '',
            Text.bold('Level Up Move List'),
            ...levelUp.map(({ level, move, type }) => `${level} ${move} - ${type}`),
            '',
            ...(eggMoves.length > 0 ? [
                Text.bold('Egg Move List'),
                eggMoves.join(', '),
                '',
            ] : []),
            ...(tmHm.length > 0 ? [
                Text.bold('TM/HM Move List'),
                tmHm.join(', '),
                '',
            ] : []),
            ...(tutorMoves.length > 0 ? [
                Text.bold('Tutor Move List'),
                tutorMoves.join(', '),
                '',
            ] : []),
            ...(zygardeCubeMoves && zygardeCubeMoves.length > 0 ? [
                Text.bold('Zygarde Cube Move List'),
                zygardeCubeMoves.join(', '),
                '',
            ] : []),
            (megaEvolutions !== undefined && megaEvolutions.length > 0 ? `${Text.bold(`Mega Evolution${megaEvolutions.length > 1 ? 's' : ''}`)}\n` + megaEvolutions.map(megaEvolution =>
                [
                    megaEvolution.name,
                    `Type${megaEvolution.types.length > 1 ? 's' : ''}: ${megaEvolution.types.join('/')}`,
                    `Stats: ${[
                        (megaEvolution.stats.hp !== undefined ? `${megaEvolution.stats.hp} HP` : ''),
                        (megaEvolution.stats.attack !== undefined ? `${megaEvolution.stats.attack} Attack` : ''),
                        (megaEvolution.stats.defense !== undefined ? `${megaEvolution.stats.defense} Defense` : ''),
                        (megaEvolution.stats.specialAttack !== undefined ? `${megaEvolution.stats.specialAttack} Special Attack` : ''),
                        (megaEvolution.stats.specialDefense !== undefined ? `${megaEvolution.stats.specialDefense} Special Defense` : ''),
                        (megaEvolution.stats.speed !== undefined ? `${megaEvolution.stats.speed} Speed` : ''),
                    ].filter((str) => str.length > 0).join(', ')}`,
                    `Ability: ${megaEvolution.ability}`,
                    [
                        (megaEvolution.abilityShift ? megaEvolution.abilityShift : ''),
                        (megaEvolution.capabilities ? `Capabilities: ${megaEvolution.capabilities.join(', ')}` : ''),
                        '',
                    ].filter((str) => str.length > 0).join('\n'),
                ].join('\n'),
            ).join('\n') : []),
            ...(extras && extras.length > 0 ? [
                ...extras.map(({ name, value }) => `${Text.bold(name)}\n${value}`),
                '',
            ] : []),
            `${source}: ${page}`,
        ];

        // Add the pokemon's line-by-line description as a page w/ the imageUrl
        acc.push({
            description: lines.join('\n'),
            imageUrl,
        });

        return acc;
    }, []);

    return pages.map(({ description, imageUrl }, index) => {
        const embed = new EmbedBuilder()
        .setTitle('Pokemon')
        .setDescription(description)
        .setColor(color);

        if (pages.length > 1)
        {
            embed.setFooter({ text: `Page ${index + 1}/${pages.length}`});
        }

        if (imageUrl)
        {
            embed.setImage(imageUrl);
        }

        return embed;
    });
};

export const getLookupPokemonByMoveEmbedMessages = (pokemon: PtuPokemon[], {
    moveName,
    moveListType,
}: {
    moveName: string;
    moveListType: PtuMoveListType;
}) =>
{
    if (pokemon.length === 0) return [];

    const {
        // Level up
        levelUp,
        totalLevelUpMoveLearnedValue,
        outliersInLevelUpData,

        // Everything else
        eggMoves,
        tmHm,
        tutorMoves,
        zygardeCubeMoves,
    } = pokemon.reduce((acc, curPokemon) =>
    {
        const {
            name,
            moveList: {
                levelUp,
                eggMoves,
                tmHm,
                tutorMoves,
                zygardeCubeMoves = [],
            },
        } = curPokemon;

        if (
            (moveListType === PtuMoveListType.LevelUp && !levelUp.find(({ move }) => move === moveName))
            || (moveListType === PtuMoveListType.TmHm && !tmHm.find((move) => move.toLowerCase().includes(moveName.toLowerCase())))
            || (moveListType === PtuMoveListType.EggMoves && !eggMoves.find((move) => move === moveName))
            || (moveListType === PtuMoveListType.TutorMoves && !tutorMoves.find((move) => move === moveName))
            || (moveListType === PtuMoveListType.ZygardeCubeMoves && !zygardeCubeMoves.find((move) => move === moveName))
        )
        {
            return acc;
        }

        if (
            moveListType === PtuMoveListType.EggMoves
            || moveListType === PtuMoveListType.TmHm
            || moveListType === PtuMoveListType.TutorMoves
            || moveListType === PtuMoveListType.ZygardeCubeMoves
        )
        {
            acc[moveListType].push(curPokemon);
            return acc;
        }

        const zygardeMove = zygardeCubeMoves.find((move) => move === moveName);
        if (zygardeMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.ZygardeCubeMoves].push(curPokemon);
            return acc;
        }

        const eggMove = eggMoves.find((move) => move === moveName);
        if (eggMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.EggMoves].push(curPokemon);
            return acc;
        }

        const tutorMove = tutorMoves.find((move) => move === moveName);
        if (tutorMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.TutorMoves].push(curPokemon);
            // Don't return acc
        }

        const tmHmMove = tmHm.find((move) => move.toLowerCase().includes(moveName.toLowerCase()));
        if (tmHmMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.TmHm].push(curPokemon);
            // Don't return acc
        }

        const levelUpMove = levelUp.find(({ move }) => move === moveName);
        if (
            (moveListType === PtuMoveListType.LevelUp || moveListType === PtuMoveListType.All)
            && levelUpMove
        )
        {
            const level = parseInt(levelUpMove.level as string, 10);

            if (!Number.isNaN(level))
            {
                acc.totalLevelUpMoveLearnedValue += level;
            }
            else
            {
                acc.outliersInLevelUpData.push({
                    name,
                    level: levelUpMove.level,
                });
            }

            acc[PtuMoveListType.LevelUp].push({
                pokemon: curPokemon,
                level,
            });
        }

        return acc;
    }, {
        [PtuMoveListType.LevelUp]: [] as {
            pokemon: PtuPokemon;
            level: string | number;
        }[],
        [PtuMoveListType.EggMoves]: [] as PtuPokemon[],
        [PtuMoveListType.TmHm]: [] as PtuPokemon[],
        [PtuMoveListType.TutorMoves]: [] as PtuPokemon[],
        [PtuMoveListType.ZygardeCubeMoves]: [] as PtuPokemon[],
        totalLevelUpMoveLearnedValue: 0,
        outliersInLevelUpData: [] as { name: string; level: string | number; }[],
    });

    // Sort level up move results by their level
    levelUp.sort((a, b) => {
        const aLevel = parseInt(a.level as string, 10);
        if (!Number.isNaN(aLevel))
        {
            1;
        }

        const bLevel = parseInt(b.level as string, 10);
        if (!Number.isNaN(bLevel))
        {
            -1;
        }

        return aLevel - bLevel;
    });

    let endOfTitle = '';
    switch (moveListType)
    {
        case PtuMoveListType.All:
            endOfTitle = '';
            break;
        case PtuMoveListType.LevelUp:
            endOfTitle = ' as a Level-Up Move';
            break;
        case PtuMoveListType.EggMoves:
            endOfTitle = ' as an Egg Move';
            break;
        case PtuMoveListType.TmHm:
            endOfTitle = ' as a TM/HM';
            break;
        case PtuMoveListType.TutorMoves:
            endOfTitle = ' as a Tutor Move';
            break;
        case PtuMoveListType.ZygardeCubeMoves:
            endOfTitle = ' as a Zygarde Cube Move';
            break;
    }
    let description = `${Text.bold(`Pokemon that can learn ${moveName}${endOfTitle}`)}\n`;

    // Level Up
    if (levelUp.length > 0)
    {
        if (description.length > 0) description += '\n';
        description += Text.bold('Learn as Level-Up Move:') + '\n';
        description += `${
            (totalLevelUpMoveLearnedValue / levelUp.length).toFixed(1)
        } Average Level\n`;

        description = outliersInLevelUpData.reduce((acc, { level, name }) => {
            acc += `${level} ${name}\n`;
            return acc;
        }, description);

        description = levelUp.reduce((acc, { level, pokemon }) => {
            acc += `${level} ${pokemon.name}\n`;
            return acc;
        }, description);
    }

    // Egg Move
    if (eggMoves.length > 0)
    {
        description = eggMoves.reduce((acc, { name }) => {
            acc += `${name}\n`;
            return acc;
        }, `${description}\n${Text.bold('Learn as Egg Move:')}\n`);
    }

    // TM/HM
    if (tmHm.length > 0)
    {
        description = tmHm.reduce((acc, { name }) => {
            acc += `${name}\n`;
            return acc;
        }, `${description}\n${Text.bold('Learn as TM/HM:')}\n`);
    }

    // Tutor Move
    if (tutorMoves.length > 0)
    {
        description = tutorMoves.reduce((acc, { name }) => {
            acc += `${name}\n`;
            return acc;
        }, `${description}\n${Text.bold('Learn as Tutor Move:')}\n`);
    }

    // Zygarde Cube Move
    if (zygardeCubeMoves.length > 0)
    {
        description = zygardeCubeMoves.reduce((acc, { name }) => {
            acc += `${name}\n`;
            return acc;
        }, `${description}\n${Text.bold('Learn as Zygarde Cube Move:')}\n`);
    }

    const lines = description.split('\n');
    const { pages } = lines.reduce(({ pages: allPages, curPageIndex }, line) =>
    {
        if (allPages[curPageIndex].length + line.length >= MAX_EMBED_DESCRIPTION_LENGTH)
        {
            curPageIndex += 1;
        }

        allPages[curPageIndex] += `${line}\n`;

        return {
            pages: allPages,
            curPageIndex,
        };
    }, {
        pages: [''] as string[],
        curPageIndex: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Pokemon',
        pages,
    });
};

export const getLookupPokemonByAbilityEmbedMessages = (pokemon: PtuPokemon[], {
    abilityName,
    abilityListType,
}: {
    abilityName: string;
    abilityListType: PtuAbilityListType;
}) =>
{
    if (pokemon.length === 0) return [];

    const {
        basicAbilities,
        advancedAbilities,
        highAbility: highAbilities,
    } = pokemon.reduce((acc, curPokemon) =>
    {
        const {
            abilities: {
                basicAbilities,
                advancedAbilities,
                highAbility,
            },
        } = curPokemon;

        if (abilityListType !== PtuAbilityListType.All)
        {
            acc[abilityListType].push(curPokemon);
            return acc;
        }

        const basicAbility = basicAbilities.find((ability) => ability === abilityName);
        if (basicAbility)
        {
            acc[PtuAbilityListType.Basic].push(curPokemon);
            return acc;
        }

        const advancedAbility = advancedAbilities.find((ability) => ability === abilityName);
        if (advancedAbility)
        {
            acc[PtuAbilityListType.Advanced].push(curPokemon);
            return acc;
        }

        if (highAbility == abilityName)
        {
            acc[PtuAbilityListType.High].push(curPokemon);
            return acc;
        }

        return acc;
    }, {
        [PtuAbilityListType.Basic]: [] as PtuPokemon[],
        [PtuAbilityListType.Advanced]: [] as PtuPokemon[],
        [PtuAbilityListType.High]: [] as PtuPokemon[],
    });

    let endOfTitle = '';
    switch (abilityListType)
    {
        case PtuAbilityListType.All:
            endOfTitle = '';
            break;
        case PtuAbilityListType.Basic:
            endOfTitle = ' as a Basic Ability';
            break;
        case PtuAbilityListType.Advanced:
            endOfTitle = ' as an Advanced Ability';
            break;
        case PtuAbilityListType.High:
            endOfTitle = ' as a High Ability';
            break;
    }
    let description = `${Text.bold(`Pokemon that can learn ${abilityName}${endOfTitle}`)}\n`;

    // Basic Ability
    if (basicAbilities.length > 0)
    {
        description = basicAbilities.reduce((acc, { name }) => {
            acc += `${name}\n`;
            return acc;
        }, `${description}\n${Text.bold('Learn as Basic Ability:')}\n`);
    }

    // Advanced Ability
    if (advancedAbilities.length > 0)
    {
        description = advancedAbilities.reduce((acc, { name }) => {
            acc += `${name}\n`;
            return acc;
        }, `${description}\n${Text.bold('Learn as Advanced Ability:')}\n`);
    }

    // Tutor Move
    if (highAbilities.length > 0)
    {
        description = highAbilities.reduce((acc, { name }) => {
            acc += `${name}\n`;
            return acc;
        }, `${description}\n${Text.bold('Learn as High Ability:')}\n`);
    }

    const lines = description.split('\n');
    const { pages } = lines.reduce(({ pages: allPages, curPageIndex }, line) =>
    {
        if (allPages[curPageIndex].length + line.length >= MAX_EMBED_DESCRIPTION_LENGTH)
        {
            curPageIndex += 1;
        }

        allPages[curPageIndex] += `${line}\n`;

        return {
            pages: allPages,
            curPageIndex,
        };
    }, {
        pages: [''] as string[],
        curPageIndex: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Pokemon',
        pages,
    });
};

export const getLookupNatureEmbedMessages = (natures: PtuNature[]) =>
{
    if (natures.length === 0) return [];

    const { pages } = natures.reduce((acc, {
        name,
        raisedStat,
        loweredStat,
        likedFlavor,
        dislikedFlavor,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            `Raised: ${raisedStat}`,
            `Lowered: ${loweredStat}`,
            `Likes: ${likedFlavor}`,
            `Dislikes: ${dislikedFlavor}`,
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate natures with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the nature to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === natures.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Natures',
        pages,
    });
};

export const getLookupStatusesEmbedMessages = (statuses: PtuStatus[]) =>
{
    if (statuses.length === 0) return [];

    const { pages } = statuses.reduce((acc, {
        name,
        type,
        isHomebrew,
        description,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name) + ((isHomebrew !== undefined && isHomebrew)
                ? ` [Homebrew]`
                : ''
            ),
            ...(type !== undefined ? [`Type: ${type}`] : []),
            ...(description !== undefined && description !== '--' ? [
                `Description:\n\`\`\`\n${description}\`\`\``
            ] : []),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate statuses with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the status to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === statuses.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Statuses',
        pages,
    });
};

export const getLookupTmsEmbedMessages = (tms: PtuTm[]) =>
{
    if (tms.length === 0) return [];

    const { pages } = tms.reduce((acc, {
        name,
        cost,
        description,
    }, index) => {
        // Stage the individual lines of the description
        const lines = [
            Text.bold(name),
            ...(cost !== undefined ? [`Cost: ${cost}`] : []),
            ...(description !== undefined && description !== '--' ? [
                `Description:\n\`\`\`\n${description}\`\`\``
            ] : []),
        ];

        // Create the description
        let curDescription = lines.join('\n');

        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        // Separate moves with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = '\n' + curDescription;
        }

        // Add the move to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === tms.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'TMs',
        pages,
    });
};
