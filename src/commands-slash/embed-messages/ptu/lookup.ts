import { EmbedBuilder } from 'discord.js';
import { Text } from '@beanc16/discordjs-helpers';

import { PtuMove } from '../../../models/PtuMove';

const color = 0xCDCDCD;

// TODO: Add listview and final paginated version (using fields) of message later

export const getLookupMovesEmbedMessage = (moves: PtuMove[]) =>
{
    const description = moves.reduce((acc, {
        name,
        type,
        category,
        frequency,
        damageBase,
        ac,
        range,
    }, index) => {
        if (index !== 0)
        {
            acc += '\n\n';
        }

        acc += `${Text.bold(name)}`;

        const secondLine = [
            ...(type !== undefined ? [`Type: ${type}`] : []),
            ...(category !== undefined ? [`Category: ${category}`] : []),
        ];
        if (secondLine.length > 0)
        {
            acc += `\n${secondLine.join(' | ')}`;
        }

        if (frequency)
        {
            acc += `\nFrequency: ${frequency}`;
        }

        const fourthLine = [
            ...(damageBase !== undefined ? [`DB: ${damageBase}`] : []),
            ...(ac !== undefined ? [`AC: ${ac}`] : []),
        ];
        if (fourthLine.length > 0)
        {
            acc += `\n${fourthLine.join(' | ')}`;
        }

        acc += `\nRange: ${range}`;

        return acc;
    }, '');

    const embed = new EmbedBuilder()
        .setTitle('Moves')
        .setDescription(description)
        .setColor(color);

    return embed;
};
