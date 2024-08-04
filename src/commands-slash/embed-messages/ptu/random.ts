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
        const descriptionString = (description !== undefined)
            ? `${description}\n`
            : '';

        const costString = (cost !== undefined)
            ? `\nCost: ${cost}`
            : '';

        return {
            name,
            value: `${descriptionString}Number: ${numOfTimesRolled}${costString}`,
        } as APIEmbedField;
    });

    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(`Result: (${rollResults})`)
        .setColor(color)
        .setFields(...fields);

    return embed;
};

export const getRandomYouFoundNothingEmbedMessage = ({
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

export const getRandomDowsingRodEmbedMessage = ({
    itemNamePluralized,
    results,
    findingShardRollResults,
    shardColorRollResults,
}: {
    itemNamePluralized: string;
    results: RandomResult[];
    findingShardRollResults: string;
    shardColorRollResults: string;
}) =>
{
    const fields = results.map(({
        name,
        cost,
        description,
        numOfTimesRolled = 1,
    }) => {
        const descriptionString = (description !== undefined)
            ? `${description}\n`
            : '';

        const costString = (cost !== undefined)
            ? `\nCost: ${cost}`
            : '';

        return {
            name,
            value: `${descriptionString}Number: ${numOfTimesRolled}${costString}`,
        } as APIEmbedField;
    });

    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(`Finding Shard Result: (${findingShardRollResults})\nShard Color Result: (${shardColorRollResults})`)
        .setColor(color)
        .setFields(...fields);

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
