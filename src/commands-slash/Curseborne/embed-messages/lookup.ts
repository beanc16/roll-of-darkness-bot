import { EmbedBuilder } from 'discord.js';

import { createEmbedMessageDescriptionAndPage, getPagedEmbedBuilders } from '../../embed-messages/shared.js';

export const getLookupCurseborneEmbedMessages = <ClassInstance extends { formattedDescription: string }>({ data, title }: {
    data: ClassInstance[];
    title: string;
}): EmbedBuilder[] =>
{
    if (data.length === 0) return [];

    const { pages } = data.reduce((pageData, { formattedDescription }, index) =>
    {
        // Stage the individual lines of the description
        const lines = [formattedDescription];

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
        title,
        pages,
    });
};
