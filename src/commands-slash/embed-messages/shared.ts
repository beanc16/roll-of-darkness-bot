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
        }>((acc, column) =>
        {
            const [curRows = [], ...rowsForFutureColumns] = chunkArray({
                array: column.rows,
                shouldMoveToNextChunk: (row, _index, rowChunk) => (
                    rowChunk.join('\n').length + row.length >= MAX_EMBED_FIELD_VALUE_LENGTH
                ),
            });

            acc.tableFields.push({
                name: column.header,
                value: curRows.join('\n'),
                inline: true,
            });

            acc.futureColumnIndexToColumnMap = rowsForFutureColumns.reduce<Record<number, APIEmbedField>>((acc, row, index) =>
            {
                const columnIndex = 3 * (index + 1) + 1;
                acc[columnIndex] = {
                    name: ' ', // Leave an empty header so it looks like the same column still
                    value: row.join('\n'),
                    inline: true,
                };

                return acc;
            }, {});

            return acc;
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

export const getPagedEmbedBuilders = ({
    title,
    pages,
    tableColumns,
    tableParsingStyle = TableParsingStyle.Fields,
    url,
}: {
    title: string;
    pages: string[];
    tableColumns?: TableColumn[];
    tableParsingStyle?: TableParsingStyle;
    url?: string;
}) =>
{
    return pages.map((description, index) => {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        if (pages.length > 1)
        {
            embed.setFooter({ text: `Page ${index + 1}/${pages.length}`})
        }

        const tableFields = (tableParsingStyle === TableParsingStyle.Fields)
            ? parseTableColumnsToFields(tableColumns)
            : [];

        if (tableFields.length > 0)
        {
            embed.addFields(tableFields);
        }

        if (url)
        {
            embed.setURL(url);
        }

        return embed;
    });
};
