import { APIEmbedField, EmbedBuilder } from 'discord.js';

import { RandomResult } from '../../Ptu';

const color = 0xCDCDCD;

export const getRandomResultEmbedMessage = ({
    itemNamePluralized,
    results,
    rollResults,
}: {
    itemNamePluralized: string;
    results: RandomResult[];
    rollResults: string;
}) =>
{
    const fields = results.map(({
        name,
        cost,
        description,
        numOfTimesRolled = 1,
    }) => {
        return {
            name,
            value: `${description}\nNumber: ${numOfTimesRolled}\nCost: ${cost}`,
        } as APIEmbedField;
    });

    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(`Result: (${rollResults})`)
        .setColor(color)
        .setFields(...fields);

    return embed;
};
