import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { createEmbedMessageDescriptionAndPage, getPagedEmbedBuilders } from '../../embed-messages/shared.js';
import { NwodMerit } from '../types/NwodMerit.js';

export const getLookupMeritsEmbedMessages = (input: NwodMerit[]): EmbedBuilder[] =>
{
    if (input.length === 0) return [];

    const { pages } = input.reduce((pageData, {
        name,
        dots,
        types,
        prerequisites,
        activationRoll,
        action,
        pageNumber,
        effect,
    }, index) =>
    {
        // Stage the individual lines of the description
        const lines = [
            `${Text.bold(name)} (${dots})`,
            ...(types !== undefined ? [`${types.length > 0 ? 'Types' : 'Type'}: ${types.join(', ')}`] : []),
            ...(prerequisites !== undefined ? [`Prerequisites: ${prerequisites}`] : []),
            ...(activationRoll !== undefined ? [`Activation Roll: ${activationRoll}`] : []),
            ...(action !== undefined ? [`Action: ${action}`] : []),
            ...(pageNumber !== undefined ? [`Page Number: ${pageNumber}`] : []),
            ...(effect !== undefined && effect !== '--'
                ? [
                    `Effect:\n\`\`\`\n${effect}\`\`\``,
                ]
                : []
            ),
        ];

        return createEmbedMessageDescriptionAndPage({
            lines,
            pageData,
            index,
        });
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Merits',
        pages,
    });
};
