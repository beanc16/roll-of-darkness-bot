import { APIEmbedField, EmbedBuilder } from 'discord.js';

import { RandomPokeball, RandomResult } from '../../Ptu';

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

export const getRandomPickupNothingEmbedMessage = ({
    itemNamePluralized,
    rollResults,
}: {
    itemNamePluralized: string;
    rollResults: string;
}) =>
{
    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(`Result: (${rollResults})\n\nYou found nothing.`)
        .setColor(color);

    return embed;
};

export const getRandomPokeballEmbedMessage = ({
    itemNamePluralized,
    results,
    rollResults,
}: {
    itemNamePluralized: string;
    results: RandomPokeball[];
    rollResults: string;
}) =>
{
    const fields = results.map(({
        name,
        cost,
        description,
        numOfTimesRolled = 1,
        mod,
        jailBreakerInfo,
    }) => {
        const tab = '　';
        const jailbreakerString = (jailBreakerInfo !== undefined)
            ? `\n${tab}*${jailBreakerInfo.name}*\n${tab}${jailBreakerInfo.description}\n${tab}Number: ${numOfTimesRolled}\n${tab}Cost: ${cost}`
            : '';

        return {
            name,
            value: `${description}\nNumber: ${numOfTimesRolled}\nCost: ${cost}\nMod: ${mod}${jailbreakerString}`,
        } as APIEmbedField;
    });

    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(`Result: (${rollResults})`)
        .setColor(color)
        .setFields(...fields);

    return embed;
};
