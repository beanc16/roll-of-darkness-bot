import { APIEmbedField, EmbedBuilder } from 'discord.js';

import { Berry } from '../../Ptu';

const color = 0xCDCDCD;

export const getRandomBerriesEmbedMessage = ({
    berries,
    rollResults,
}: {
    berries: Berry[];
    rollResults: string;
}) =>
{
    const fields = berries.map(({
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
        .setTitle('Random Berries')
        .setDescription(`Result: (${rollResults})`)
        .setColor(color)
        .setFields(...fields);

    return embed;
};
