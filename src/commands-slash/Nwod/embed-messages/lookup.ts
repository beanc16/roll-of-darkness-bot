import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { createEmbedMessageDescriptionAndPage, getPagedEmbedBuilders } from '../../embed-messages/shared.js';
import { NwodCondition } from '../types/NwodCondition.js';
import { NwodMerit } from '../types/NwodMerit.js';

export const getLookupConditionsEmbedMessages = (input: NwodCondition[]): EmbedBuilder[] =>
{
    if (input.length === 0) return [];

    const { pages } = input.reduce((pageData, {
        name,
        description,
        resolution,
        beat,
        possibleSources,
    }, index) =>
    {
        // Stage the individual lines of the description
        const lines = [
            `${Text.bold(name)}`,
            ...(description !== undefined
                ? [
                    `Description:\n\`\`\`\n${description}\`\`\``,
                ]
                : []
            ),
            ...(resolution !== undefined
                ? [
                    `Resolution:\n\`\`\`\n${resolution}\`\`\``,
                ]
                : []
            ),
            ...(beat !== undefined
                ? [
                    `Beat:\n\`\`\`\n${beat}\`\`\``,
                ]
                : []
            ),
            ...(possibleSources !== undefined
                ? [
                    `Possible Sources:\n\`\`\`\n${possibleSources}\`\`\``,
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
        title: 'Conditions',
        pages,
    });
};

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
