import { APIEmbedField, EmbedBuilder } from 'discord.js';

import { PtuNature } from '../types/PtuNature.js';
import { RandomPokeball, RandomResult } from '../types/PtuRandom.js';

const color = 0xCDCDCD;
const tab = '　';

export const getRandomResultEmbedMessage = ({
    itemNamePluralized,
    results,
    rollResults,
}: {
    itemNamePluralized: string;
    results: RandomResult[];
    rollResults: string;
}): EmbedBuilder =>
{
    const fields = results.map(({
        name,
        cost,
        description,
        numOfTimesRolled = 1,
    }) =>
    {
        const descriptionString = (description !== undefined && description !== '--')
            ? `${description}\n`
            : '';

        const costString = (cost !== undefined && cost !== '--')
            ? `\nCost: ${cost}`
            : '';

        return {
            name,
            value: `${descriptionString}Amount: ${numOfTimesRolled}${costString}`,
        } as APIEmbedField;
    });

    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(`Result: (${rollResults})`)
        .setColor(color)
        .setFields(...fields);

    return embed;
};

export const getRandomYouFoundNothingEmbedMessage = ({ itemNamePluralized, rollResults }: {
    itemNamePluralized: string;
    rollResults: string;
}): EmbedBuilder =>
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
    findingShardsRollResults,
    shardColorRollResults,
}: {
    itemNamePluralized: string;
    results: RandomResult[];
    findingShardsRollResults: number[][];
    shardColorRollResults: number[][];
}): EmbedBuilder =>
{
    const parseShardRollResults = (rollResults: number[][]): string =>
    {
        return rollResults.reduce((acc, cur, index) =>
        {
            const lineBreak = (index === 0) ? '' : '\n';
            const resultStr = (cur.length > 0)
                ? `(${cur.join(', ')})`
                : '--';
            return acc + `${lineBreak}${resultStr}`;
        }, '');
    };

    const fields = results.map(({
        name,
        cost,
        description,
        numOfTimesRolled = 1,
    }) =>
    {
        const descriptionString = (description !== undefined)
            ? `${description}\n`
            : '';

        const costString = (cost !== undefined)
            ? `\nCost: ${cost}`
            : '';

        return {
            name,
            value: `${descriptionString}Amount: ${numOfTimesRolled}${costString}`,
        } as APIEmbedField;
    });

    const description = [
        'Finding Shard Result:',
        parseShardRollResults(findingShardsRollResults),
        '',
        'Shard Color Result:',
        parseShardRollResults(shardColorRollResults),
    ].join('\n');

    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(description)
        .setColor(color)
        .setFields(...fields);

    return embed;
};

export const getRandomNatureEmbedMessage = ({
    itemNamePluralized,
    results,
    rollResults,
}: {
    itemNamePluralized: string;
    results: PtuNature[];
    rollResults: string;
}): EmbedBuilder =>
{
    const fields = results.map(({
        name,
        raisedStat,
        loweredStat,
        likedFlavor,
        dislikedFlavor,
    }) =>
    {
        const lines = [
            `Raised: ${raisedStat}`,
            `Lowered: ${loweredStat}`,
            `Likes: ${likedFlavor}`,
            `Dislikes: ${dislikedFlavor}`,
        ];

        return {
            name,
            value: lines.join('\n'),
        } as APIEmbedField;
    });

    const embed = new EmbedBuilder()
        .setTitle(`Random ${itemNamePluralized}`)
        .setDescription(`Result: (${rollResults})`)
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
}): EmbedBuilder =>
{
    const fields = results.map(({
        name,
        cost,
        description,
        numOfTimesRolled = 1,
        mod,
        jailBreakerInfo,
    }) =>
    {
        const jailbreakerString = (jailBreakerInfo !== undefined)
            ? `\n${tab}*${jailBreakerInfo.name}*\n${tab}${jailBreakerInfo.description}\n${tab}Amount: ${numOfTimesRolled}\n${tab}Cost: ${cost}`
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
