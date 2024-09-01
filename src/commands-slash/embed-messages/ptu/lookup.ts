import { EmbedBuilder } from 'discord.js';

import { PtuAbility } from '../../../models/PtuAbility.js';
import { PtuMove } from '../../../models/PtuMove.js';
import { Text } from '@beanc16/discordjs-helpers';

const MAX_EMBED_DESCRIPTION_LENGTH = 4096;
const color = 0xCDCDCD;

// TODO: Add listview and final paginated version (using fields) of message later

export const getLookupAbilitiesEmbedMessages = (moves: PtuAbility[]) =>
{
    if (moves.length === 0) return [];

    const { pages } = moves.reduce((acc, {
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
