import { APIEmbedField, EmbedBuilder } from 'discord.js';

import { MAX_EMBED_DESCRIPTION_LENGTH } from '../../constants/discord.js';
import { chunkArray } from '../../services/chunkArray/chunkArray.js';

export interface TableColumn
{
    header: string;
    rows: string[];
}

export enum TableParsingStyle
{
    Fields = 'Fields',
    Description = 'Description',
}

export interface PageData
{
    pages: string[];
    tableColumns?: TableColumn[];
    curPage: number;
}

export interface CreateEmbedMessageDescriptionAndPageOptions
{
    lines: string[];
    pageData: PageData;
    tableData?: string;
    index: number;
}

const color = 0xCDCDCD;

// Discord only allows 3 in-line columns to be displayed at a time
const MAX_EMBED_FIELD_COLUMNS = 3;

// Discord only allows a max value length of 1024 for embed fields
export const MAX_EMBED_FIELD_VALUE_LENGTH = 1024;

const emptyColumn: APIEmbedField = {
    name: ' ',
    value: ' ',
    inline: true,
};

// NOTE: This is only covered by unit tests for other functions, this function has no unit tests of its own yet.
const splitOnLastCodeBlock = (input: string): string[] =>
{
    // Match all blocks with a title and code block
    const regex = /([^\n]+):\n```[\s\S]*?```/g;
    let lastMatchIndex = -1;
    let match = regex.exec(input);

    // Iterate through all matches to find the last one
    while (match !== null)
    {
        lastMatchIndex = match.index;
        match = regex.exec(input);
    }

    // If no matches are found, return the whole input as one page
    if (lastMatchIndex === -1)
    {
        return [input];
    }

    // Split the input into two parts: everything before and after the last match
    const firstPart = input.slice(0, lastMatchIndex).trim();
    const secondPart = input.slice(lastMatchIndex).trim();

    return [firstPart, secondPart];
};

export const parseTableColumnsToFields = (tableColumns: TableColumn[] = []): APIEmbedField[] =>
{
    const columnsChunkedIntoThrees = chunkArray({
        array: tableColumns,
        shouldMoveToNextChunk: (_, index) => index % 3 === 0 && index !== 0,
    }) as [TableColumn, TableColumn, TableColumn][];

    return columnsChunkedIntoThrees.reduce<APIEmbedField[]>((acc, columns) =>
    {
        const { tableFields, futureColumnIndexToColumnMap } = columns.reduce<{
            tableFields: APIEmbedField[];
            futureColumnIndexToColumnMap: Record<number, APIEmbedField>;
        }>((acc2, column) =>
        {
            const [curRows = [], ...rowsForFutureColumns] = chunkArray({
                array: column.rows,
                shouldMoveToNextChunk: (row, _index, rowChunk) => (
                    rowChunk.join('\n').length + row.length >= MAX_EMBED_FIELD_VALUE_LENGTH
                ),
            });

            acc2.tableFields.push({
                name: column.header,
                value: curRows.join('\n'),
                inline: true,
            });

            acc2.futureColumnIndexToColumnMap = rowsForFutureColumns.reduce<Record<number, APIEmbedField>>((acc3, row, index) =>
            {
                const columnIndex = 3 * (index + 1) + 1;
                acc3[columnIndex] = {
                    name: ' ', // Leave an empty header so it looks like the same column still
                    value: row.join('\n'),
                    inline: true,
                };

                return acc3;
            }, {});

            return acc2;
        }, { tableFields: [], futureColumnIndexToColumnMap: {} });

        // Fill in remaining empty columns to get a multiple of MAX_EMBED_FIELD_COLUMNS
        while (tableFields.length % MAX_EMBED_FIELD_COLUMNS !== 0)
        {
            tableFields.push(emptyColumn);
        }

        // Add future columns
        let nextColumnIndex = tableFields.length;
        Object.entries(futureColumnIndexToColumnMap).forEach(([columnIndex, column]) =>
        {
            // Fill in empty columns until the necessary columnIndex is reached
            while (parseInt(columnIndex, 10) % MAX_EMBED_FIELD_COLUMNS !== nextColumnIndex % MAX_EMBED_FIELD_COLUMNS)
            {
                tableFields.push(emptyColumn);
                nextColumnIndex += 1;
            }

            tableFields.push(column);
            nextColumnIndex += 1;
        });

        // Fill in remaining empty columns to get a multiple of MAX_EMBED_FIELD_COLUMNS
        while (tableFields.length % MAX_EMBED_FIELD_COLUMNS !== 0)
        {
            tableFields.push(emptyColumn);
        }

        acc.push(...tableFields);

        return acc;
    }, []);
};

const parseTableColumnsToDescription = (tableColumns: TableColumn[] = []): string =>
{
    let description = '';

    // Determine the maximum number of rows in any column
    const maxRows = Math.max(...tableColumns.map(column => column.rows.length));

    // Parse all entries
    for (let index = 0; index < maxRows; index += 1)
    {
        // Parse one entry
        description += tableColumns.reduce((acc2, column) =>
        {
            // Only add the row if it exists
            if (column.rows[index])
            {
                return acc2 + `${column.header}: ${column.rows[index]}\n`;
            }

            return acc2;
        }, '');

        // Add a blank line after each group
        description += '\n';
    }

    return `${description}\`\`\``;
};

export const getPagedEmbedBuilders = ({
    title,
    pages,
    tableColumns = [],
    tableParsingStyle = TableParsingStyle.Description,
    url,
}: {
    title: string;
    pages: string[];
    tableColumns?: TableColumn[];
    tableParsingStyle?: TableParsingStyle;
    url?: string;
}): EmbedBuilder[] =>
{
    const embeds = pages.map((initialDescription, index) =>
    {
        const tableParsingStyleToParser: Record<TableParsingStyle, () => string | APIEmbedField[]> = {
            [TableParsingStyle.Description]: () => parseTableColumnsToDescription(tableColumns),
            [TableParsingStyle.Fields]: () => parseTableColumnsToFields(tableColumns),
        };
        const tableResult = (tableColumns.length > 0)
            ? tableParsingStyleToParser[tableParsingStyle]()
            : [];

        // Delete the end of the code block for description in table parsing
        let parsedDescription = initialDescription;
        if (!Array.isArray(tableResult))
        {
            const indexOfEndOfCodeBlock = initialDescription.lastIndexOf('```');
            parsedDescription = (indexOfEndOfCodeBlock === -1)
                ? initialDescription
                : initialDescription.slice(0, indexOfEndOfCodeBlock);
        }

        const description = (Array.isArray(tableResult))
            ? parsedDescription
            : [parsedDescription, tableResult].join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        if (pages.length > 1)
        {
            embed.setFooter({ text: `Page ${index + 1}/${pages.length}` });
        }

        if (Array.isArray(tableResult) && tableResult.length > 0)
        {
            embed.addFields(tableResult);
        }

        if (url)
        {
            embed.setURL(url);
        }

        return embed;
    });

    return embeds;
};

export const createEmbedMessageDescriptionAndPage = ({
    lines,
    pageData,
    tableData,
    index,
}: CreateEmbedMessageDescriptionAndPageOptions): PageData =>
{
    // Create a clone of the page data so the original parameter's data isn't mutated
    const pageDataOutput = { ...pageData };

    // Create the description
    let curDescription = lines.join('\n');

    // Don't allow a description to exceed the max limit
    if (curDescription.length > MAX_EMBED_DESCRIPTION_LENGTH)
    {
        // This is a naive split that splits on the last code block.
        // This won't cover all cases, but covers the current necessary cases.
        const [firstPart, secondPart] = splitOnLastCodeBlock(curDescription);
        pageDataOutput.pages[pageDataOutput.curPage] = firstPart;
        pageDataOutput.curPage += 1;
        pageDataOutput.pages[pageDataOutput.curPage] = '';
        curDescription = secondPart;
    }

    // Don't let descriptions exceed the max limit
    if (pageDataOutput.pages[pageDataOutput.curPage].length + curDescription.length + '\n\n'.length > MAX_EMBED_DESCRIPTION_LENGTH)
    {
        pageDataOutput.curPage += 1;
        pageDataOutput.pages[pageDataOutput.curPage] = '';
    }

    // Separate entries with a blank line
    if (index !== 0 && pageDataOutput.pages[pageDataOutput.curPage] !== '')
    {
        curDescription = '\n' + curDescription;
    }

    // Add the entry to the current page's description
    pageDataOutput.pages[pageDataOutput.curPage] += curDescription;

    if (tableData !== undefined && tableData !== '--' && tableData.length > 0)
    {
        const columns = tableData.split('\n');

        if (!pageDataOutput.tableColumns)
        {
            pageDataOutput.tableColumns = [];
        }

        columns.forEach((column) =>
        {
            const [header, ...rows] = column.split('|');

            pageDataOutput.tableColumns?.push({
                header,
                rows,
            });
        });
    }

    return pageDataOutput;
};

/* istanbul ignore next */
export const getPagedEmbedMessages = <Element>({
    input,
    title,
    parseElementToLines,
}: {
    input: Element[];
    title: string;
    parseElementToLines: (element: Element, index: number) => string[];
}): EmbedBuilder[] =>
{
    if (input.length === 0) return [];

    const { pages } = input.reduce((pageData, element, index) =>
    {
        // Stage the individual lines of the description
        const lines = parseElementToLines(element, index);

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

/**
 * Splits a CSV string into pages, ensuring each page doesn't exceed the character limit.
 * 
 * @param input - The input CSV string to paginate
 * @param delimiter - The delimiter to split on (default: '\n')
 * @param maxChars - Maximum characters per page (default: 2000)
 * @returns Array of paginated strings
 */
export const paginateCsv = ({
    input,
    delimiter = '\n',
    maxChars = 2000,
}: {
    input: string;
    delimiter?: string;
    maxChars?: number;
}): string[] =>
{
    const rows = input.split(delimiter);

    const pages: string[] = [];
    let currentPage: string[] = [];
    let currentLength = 0;

    rows.forEach((row) =>
    {
        // Calculate length including the delimiter (except for first row in page)
        const rowLength = row.length + (currentPage.length > 0 ? delimiter.length : 0);

        // Adding this row would exceed the limit
        if (currentLength + rowLength > maxChars && currentPage.length > 0)
        {
            // Save current page and start a new one
            pages.push(currentPage.join(delimiter));
            currentPage = [row];
            currentLength = row.length;
        }

        else
        {
            // Add row to current page
            currentPage.push(row);
            currentLength += rowLength;
        }
    });

    // Add the last page if it has content
    if (currentPage.length > 0) {
        pages.push(currentPage.join(delimiter));
    }

    return pages;
}
