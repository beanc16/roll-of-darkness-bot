import { EmbedBuilder } from 'discord.js';

import { PtuAbility } from '../../../models/PtuAbility.js';
import { PtuMove } from '../../../models/PtuMove.js';
import { Text } from '@beanc16/discordjs-helpers';
import { PtuTm } from '../../../models/PtuTm.js';
import { PtuNature } from '../../../models/PtuNature.js';
import { PtuMoveListType, PtuPokemon } from '../../../types/pokemon.js';

const MAX_EMBED_DESCRIPTION_LENGTH = 4096;
const color = 0xCDCDCD;

// TODO: Add listview and final paginated version (using fields) of message later

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

    return pages.map((description, index) => {
        const embed = new EmbedBuilder()
        .setTitle('Abilities')
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: `Page ${index + 1}/${pages.length}`});

        return embed;
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

    return pages.map((description, index) => {
        const embed = new EmbedBuilder()
        .setTitle('Moves')
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: `Page ${index + 1}/${pages.length}`});

        return embed;
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
        megaEvolution,
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
            ...(megaEvolution !== undefined ? [
                Text.bold('Mega Evolution'),
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
                ].filter((str) => str.length > 0),
            ] : []),
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
        .setColor(color)
        .setFooter({ text: `Page ${index + 1}/${pages.length}`});

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
        if (zygardeMove)
        {
            acc[PtuMoveListType.ZygardeCubeMoves].push(curPokemon);
            return acc;
        }

        const eggMove = eggMoves.find((move) => move === moveName);
        if (eggMove)
        {
            acc[PtuMoveListType.EggMoves].push(curPokemon);
            return acc;
        }

        const tutorMove = tutorMoves.find((move) => move === moveName);
        if (tutorMove)
        {
            acc[PtuMoveListType.TutorMoves].push(curPokemon);
            // Don't return acc
        }

        const tmHmMove = tmHm.find((move) => move.toLowerCase().includes(moveName.toLowerCase()));
        if (tmHmMove)
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

    let description = '';

    // Level Up
    if (levelUp.length > 0)
    {
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

    return pages.map((curPage, index) =>
    {
        return new EmbedBuilder()
            .setTitle('Pokemon')
            .setDescription(curPage)
            .setColor(color)
            .setFooter({ text: `Page ${index + 1}/${pages.length}` });
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
            curDescription = '\n\n' + curDescription;
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

    return pages.map((description, index) => {
        const embed = new EmbedBuilder()
        .setTitle('Natures')
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: `Page ${index + 1}/${pages.length}`});

        return embed;
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
            curDescription = '\n\n' + curDescription;
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

    return pages.map((description, index) => {
        const embed = new EmbedBuilder()
        .setTitle('TMs')
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: `Page ${index + 1}/${pages.length}`});

        return embed;
    });
};
