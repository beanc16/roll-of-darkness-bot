import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { getPagedEmbedMessages } from '../../embed-messages/shared.js';
import { ChangelingGoblinFruit } from '../types/ChangelingGoblinFruit.js';

export const getLookupGoblinFruitEmbedMessages = (input: ChangelingGoblinFruit[]): EmbedBuilder[] =>
{
    const output = getPagedEmbedMessages({
        input,
        title: 'Goblin Fruits',
        parseElementToLines: element => [
            Text.bold(element.name),
            ...(element.rarity !== undefined
                ? [`Rarity: ${element.rarity}`]
                : []
            ),
            ...(element.pageNumber !== undefined
                ? [`Page Number: ${element.pageNumber}`]
                : []
            ),
            ...(element.effect !== undefined
                ? [
                    `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                ]
                : []
            ),
        ],
    });

    return output;
};
