import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { MAX_EMBED_DESCRIPTION_LENGTH } from '../../../constants/discord.js';
import { getPagedEmbedBuilders, getPagedEmbedMessages } from '../../embed-messages/shared.js';
import { PtuMove } from '../models/PtuMove.js';
import { removeExtraCharactersFromMoveName } from '../services/pokemonMoveHelpers.js';
import {
    PtuAbilityListType,
    PtuMoveListType,
    type PtuPokemon,
} from '../types/pokemon.js';

const color = 0xCDCDCD;

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
            ...(element.effects && element.effects !== '--'
                ? [`Effect:\n\`\`\`\n${element.effects}\`\`\``]
                : ['']
            ),
        ],
    });

    return output;
};

export const getLookupPokemonEmbedMessages = (
    pokemon: PtuPokemon[],
    moveNameToMovesRecord: Record<string, PtuMove>,
): EmbedBuilder[] =>
{
    if (pokemon.length === 0) return [];

    const hasMoveNameToMovesRecord = Object.keys(moveNameToMovesRecord).length > 0
        ? 'true'
        : 'false';

    const getContestStatInfoByMoveName = (moveName: string): string =>
    {
        const parsedMoveName = removeExtraCharactersFromMoveName(moveName);

        if (!moveNameToMovesRecord[parsedMoveName])
        {
            return '';
        }

        const { contestStatType, contestStatEffect } = moveNameToMovesRecord[parsedMoveName];

        if (!(contestStatType || contestStatEffect))
        {
            return '';
        }

        return `(${[contestStatType, contestStatEffect].join(' - ')})`;
    };

    const joinWithContestInfo = (moveNames: string[]): string =>
    {
        const output = moveNames.reduce<string>((acc, cur, index) =>
        {
            const contestInfo = getContestStatInfoByMoveName(cur);
            const booleanToSeparator: Record<'true' | 'false', string> = {
                true: '\n',
                false: ', ',
            };

            const separator = (index > 0) ? booleanToSeparator[hasMoveNameToMovesRecord] : '';

            return `${acc}${separator}${cur}${contestInfo ? ` ${contestInfo}` : ''}`;
        }, '');

        return output;
    };

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
        sizeInformation: { height, weight },
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
    }) =>
    {
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
            `Total: ${Object.values(baseStats).reduce((acc2, val) => acc2 + val, 0)}`,
            '',
            Text.bold('Basic Information'),
            `Type${types.length > 1 ? 's' : ''}: ${types.join('/')}`,
            ...basicAbilities.map((ability, index) => `Basic Ability: ${index + 1}: ${ability}`),
            ...advancedAbilities.map((ability, index) => `Advanced Ability: ${index + 1}: ${ability}`),
            `High Ability: ${highAbility}`,
            '',
            Text.bold('Evolution'),
            ...evolution.sort((a, b) => a.stage - b.stage).map(({
                name: evolutionName,
                level,
                stage,
            }) =>
            {
                const minimumLevelString = (stage >= 2 && level > 1)
                    ? ` Minimum ${level}`
                    : ''; // Don't include minimum level for 2+ stage evolutions that're level 1. They probably evolve with an evolution stone, which is included in the name.

                return `${stage} - ${evolutionName}${minimumLevelString}`;
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
                ...(capabilities.levitate !== undefined ? [`Levitate: ${capabilities.levitate}`] : []),
                ...(capabilities.burrow !== undefined ? [`Burrow: ${capabilities.burrow}`] : []),
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
            ...levelUp.map(({
                level,
                move,
                type,
            }) => `${level} ${move} - ${type}${getContestStatInfoByMoveName(move) ? ` ${getContestStatInfoByMoveName(move)}` : ''}`),
            '',
            ...(eggMoves.length > 0
                ? [
                    Text.bold('Egg Move List'),
                    joinWithContestInfo(eggMoves),
                    '',
                ]
                : []
            ),
            ...(tmHm.length > 0
                ? [
                    Text.bold('TM/HM Move List'),
                    joinWithContestInfo(tmHm),
                    '',
                ]
                : []
            ),
            ...(tutorMoves.length > 0
                ? [
                    Text.bold('Tutor Move List'),
                    joinWithContestInfo(tutorMoves),
                    '',
                ]
                : []
            ),
            ...(zygardeCubeMoves && zygardeCubeMoves.length > 0
                ? [
                    Text.bold('Zygarde Cube Move List'),
                    joinWithContestInfo(zygardeCubeMoves),
                    '',
                ]
                : []
            ),
            (megaEvolutions !== undefined && megaEvolutions.length > 0
                ? `${Text.bold(`Mega Evolution${megaEvolutions.length > 1 ? 's' : ''}`)}\n` + megaEvolutions.map(megaEvolution =>
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
                        ].filter(str => str.length > 0).join(', ')}`,
                        `Ability: ${megaEvolution.ability}`,
                        [
                            (megaEvolution.abilityShift ? megaEvolution.abilityShift : ''),
                            (megaEvolution.capabilities ? `Capabilities: ${megaEvolution.capabilities.join(', ')}` : ''),
                            '',
                        ].filter(str => str.length > 0).join('\n'),
                    ].join('\n'),
                ).join('\n')
                : []
            ),
            ...(extras && extras.length > 0
                ? [
                    ...extras.map(({ name: extraName, value }) => `${Text.bold(extraName)}\n${value}`),
                    '',
                ]
                : []
            ),
            `${source}: ${page}`,
        ];

        // Add the pokemon's line-by-line description as a page w/ the imageUrl
        acc.push({
            description: lines.join('\n'),
            imageUrl,
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

export const getLookupPokemonByMoveEmbedMessages = (pokemon: PtuPokemon[], { moveName, moveListType }: {
    moveName: string;
    moveListType: PtuMoveListType;
}): EmbedBuilder[] =>
{
    if (pokemon.length === 0) return [];

    const {
        levelUp,
        totalLevelUpMoveLearnedValue,
        outliersInLevelUpData,
        eggMoves,
        tmHm,
        tutorMoves,
        zygardeCubeMoves,
    } = pokemon.reduce((acc, curPokemon) =>
    {
        const { name, moveList } = curPokemon;

        if (
            (moveListType === PtuMoveListType.LevelUp && !moveList.levelUp.find(({ move }) => move === moveName))
            || (moveListType === PtuMoveListType.TmHm && !moveList.tmHm.find(move => move.toLowerCase().includes(moveName.toLowerCase())))
            || (moveListType === PtuMoveListType.EggMoves && !moveList.eggMoves.find(move => move === moveName))
            || (moveListType === PtuMoveListType.TutorMoves && !moveList.tutorMoves.find(move => move === moveName))
            || ((moveListType === PtuMoveListType.ZygardeCubeMoves && !moveList.zygardeCubeMoves) || (moveList.zygardeCubeMoves && !moveList.zygardeCubeMoves.find(move => move === moveName)))
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

        const zygardeMove = (moveList?.zygardeCubeMoves ?? []).find(move => move === moveName);
        if (zygardeMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.ZygardeCubeMoves].push(curPokemon);
            return acc;
        }

        const eggMove = moveList.eggMoves.find(move => move === moveName);
        if (eggMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.EggMoves].push(curPokemon);
            return acc;
        }

        const tutorMove = moveList.tutorMoves.find(move => move === moveName);
        if (tutorMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.TutorMoves].push(curPokemon);
            // Don't return acc
        }

        const tmHmMove = moveList.tmHm.find(move => move.toLowerCase().includes(moveName.toLowerCase()));
        if (tmHmMove && moveListType === PtuMoveListType.All)
        {
            acc[PtuMoveListType.TmHm].push(curPokemon);
            // Don't return acc
        }

        const levelUpMove = moveList.levelUp.find(({ move }) => move === moveName);
        if (
            (moveListType === PtuMoveListType.LevelUp || moveListType === PtuMoveListType.All)
            && levelUpMove
        )
        {
            const level = parseInt(levelUpMove.level as string, 10);

            if (!Number.isNaN(level))
            {
                acc.totalLevelUpMoveLearnedValue += level;
                acc[PtuMoveListType.LevelUp].push({
                    pokemon: curPokemon,
                    level: (!Number.isNaN(level))
                        ? levelUpMove.level
                        : level,
                });
            }
            else
            {
                acc.outliersInLevelUpData.push({
                    name,
                    level: levelUpMove.level,
                });
            }
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
        outliersInLevelUpData: [] as { name: string; level: string | number }[],
    });

    // Sort level up move results by their level
    levelUp.sort((a, b) =>
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
    if (levelUp.length > 0 || outliersInLevelUpData.length > 0)
    {
        if (description.length > 0) description += '\n';
        description += Text.bold('Learn as Level-Up Move:') + '\n';
        description += `${
            ((totalLevelUpMoveLearnedValue / levelUp.length) || 0).toFixed(1)
        } Average Level\n`;

        description = outliersInLevelUpData.reduce(
            (acc, { level, name }) => acc + `${level} ${name}\n`,
            description,
        );

        description = levelUp.reduce(
            (acc, { level, pokemon: curPokemon }) => (
                acc + `${level} ${curPokemon.name}\n`
            ),
            description,
        );
    }

    // Egg Move
    if (eggMoves.length > 0)
    {
        description = eggMoves.reduce(
            (acc, { name }) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Egg Move:')}\n`,
        );
    }

    // TM/HM
    if (tmHm.length > 0)
    {
        description = tmHm.reduce(
            (acc, { name }) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as TM/HM:')}\n`,
        );
    }

    // Tutor Move
    if (tutorMoves.length > 0)
    {
        description = tutorMoves.reduce(
            (acc, { name }) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Tutor Move:')}\n`,
        );
    }

    // Zygarde Cube Move
    if (zygardeCubeMoves.length > 0)
    {
        description = zygardeCubeMoves.reduce(
            (acc, { name }) => acc + `${name}\n`,
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

export const getLookupPokemonByAbilityEmbedMessages = (pokemon: PtuPokemon[], { abilityName, abilityListType }: {
    abilityName: string;
    abilityListType: PtuAbilityListType;
}): EmbedBuilder[] =>
{
    if (pokemon.length === 0) return [];

    const {
        basicAbilities,
        advancedAbilities,
        highAbility: highAbilities,
    } = pokemon.reduce((acc, curPokemon) =>
    {
        const { abilities } = curPokemon;

        if (abilityListType !== PtuAbilityListType.All)
        {
            acc[abilityListType].push(curPokemon);
            return acc;
        }

        const basicAbility = abilities.basicAbilities.find(ability => ability === abilityName);
        if (basicAbility)
        {
            acc[PtuAbilityListType.Basic].push(curPokemon);
            return acc;
        }

        const advancedAbility = abilities.advancedAbilities.find(ability => ability === abilityName);
        if (advancedAbility)
        {
            acc[PtuAbilityListType.Advanced].push(curPokemon);
            return acc;
        }

        if (abilities.highAbility === abilityName)
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

    const abilityListTypeToEndOfTitle: Record<PtuAbilityListType, string> = {
        [PtuAbilityListType.All]: '',
        [PtuAbilityListType.Basic]: ' as a Basic Ability',
        [PtuAbilityListType.Advanced]: ' as an Advanced Ability',
        [PtuAbilityListType.High]: ' as a High Ability',
    };
    let description = `${Text.bold(`Pokemon that can learn ${abilityName}${abilityListTypeToEndOfTitle[abilityListType]}`)}\n`;

    // Basic Ability
    if (basicAbilities.length > 0)
    {
        description = basicAbilities.reduce(
            (acc, { name }) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Basic Ability:')}\n`,
        );
    }

    // Advanced Ability
    if (advancedAbilities.length > 0)
    {
        description = advancedAbilities.reduce(
            (acc, { name }) => acc + `${name}\n`,
            `${description}\n${Text.bold('Learn as Advanced Ability:')}\n`,
        );
    }

    // Tutor Move
    if (highAbilities.length > 0)
    {
        description = highAbilities.reduce(
            (acc, { name }) => acc + `${name}\n`,
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

export const getLookupPokemonByCapabilityEmbedMessages = (pokemon: PtuPokemon[], { capabilityName }: {
    capabilityName: string;
}): EmbedBuilder[] =>
{
    const lines = pokemon.map(({ name }) => name);
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
