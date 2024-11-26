import { APIEmbedField, EmbedBuilder } from 'discord.js';

import { chunkArray } from '../../services/chunkArray.js';

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
