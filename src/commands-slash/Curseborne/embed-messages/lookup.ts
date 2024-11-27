import { EmbedBuilder } from 'discord.js';

import { MAX_EMBED_DESCRIPTION_LENGTH } from '../../../constants/discord.js';
import { getPagedEmbedBuilders } from '../../embed-messages/shared.js';

export const getLookupCurseborneEmbedMessages = <ClassInstance extends { formattedDescription: string }>({ data, title }: {
    data: ClassInstance[];
    title: string;
}): EmbedBuilder[] =>
{
    if (data.length === 0) return [];

    const { pages } = data.reduce((acc, { formattedDescription }, index) =>
    {
        // Don't let descriptions exceed the max limit
        if (acc.pages[acc.curPage].length + formattedDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
        {
            acc.curPage += 1;
            acc.pages[acc.curPage] = '';
        }

        let curDescription = formattedDescription;

        // Separate elements with a blank line
        if (index !== 0 && acc.pages[acc.curPage] !== '')
        {
            curDescription = `\n${formattedDescription}`;
        }

        // Add the element to the current page's description
        acc.pages[acc.curPage] += curDescription;

        // Close the code block on the last tm
        if (index === data.length - 1)
        {
            acc.pages[acc.curPage] += '';
        }

        return acc;
    }, {
        pages: [''],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title,
        pages,
    });
};
