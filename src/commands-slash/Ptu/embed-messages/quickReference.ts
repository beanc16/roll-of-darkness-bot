import { EmbedBuilder } from 'discord.js';

import { createEmbedMessageDescriptionAndPage, getPagedEmbedBuilders } from '../../embed-messages/shared.js';

export const getQrBookMechanicsEmbedMessages = (lines: string[]): EmbedBuilder[] =>
{
    if (lines.length === 0) return [];

    return getPagedEmbedBuilders({
        title: 'Book Mechanics',
        pages: [
            lines.join('\n'),
        ],
    });
};

export const getQrDamageChartsEmbedMessages = (input: string[][]): EmbedBuilder[] =>
{
    if (
        Object.values(input).length === 0
        || Object.values(input).every(column => column.length === 0)
    ) return [];

    const tableData = `\`\`\`\n${input.map(column => column.join('|')).join('\n')}`;

    const { pages, tableColumns } = createEmbedMessageDescriptionAndPage({
        tableData,
        lines: [],
        pageData: { pages: ['```\n```'], curPage: 0 },
        index: 0,
    });

    return getPagedEmbedBuilders({
        title: 'Damage Charts',
        pages,
        tableColumns,
    });
};
