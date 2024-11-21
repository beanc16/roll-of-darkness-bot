import { MAX_EMBED_FIELD_VALUE_LENGTH, parseTableColumnsToFields, type TableColumn } from '../../../../src/commands-slash/embed-messages/shared.js';

describe('function: parseTableColumnsToFields', () =>
{
    describe('empty state', () =>
    {
        it('should return an empty array if no columns are provided', () =>
        {
            const result = parseTableColumnsToFields();
            expect(result).toEqual([]);
        });

        it('should return an empty array if an empty array of columns is provided', () =>
        {
            const result = parseTableColumnsToFields([]);
            expect(result).toEqual([]);
        });
    });

    describe('single column', () =>
    {
        it('should correctly parse a single column with no rows', () =>
        {
            const input: TableColumn[] = [
                { header: 'Column 1', rows: [] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Column 1', value: '', inline: true },
                { name: ' ', value: ' ', inline: true },
                { name: ' ', value: ' ', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });

        it('should correctly parse a single column with multiple rows', () =>
        {
            const input: TableColumn[] = [
                { header: 'Column 1', rows: ['Row 1', 'Row 2', 'Row 3'] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Column 1', value: 'Row 1\nRow 2\nRow 3', inline: true },
                { name: ' ', value: ' ', inline: true },
                { name: ' ', value: ' ', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });

        it('should handle special characters in headers and rows', () =>
        {
            const input: TableColumn[] = [
                { header: 'Header & Name', rows: ['Row #1', 'Row #2'] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Header & Name', value: 'Row #1\nRow #2', inline: true },
                { name: ' ', value: ' ', inline: true },
                { name: ' ', value: ' ', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });
    });

    describe('multiple columns', () =>
    {
        // The first three tests indirectly ensure that the number of columns always matches the MAX_EMBED_FIELD_COLUMNS constant
        it('should correctly parse two columns with rows', () =>
        {
            const input: TableColumn[] = [
                { header: 'Column 1', rows: ['Row 1', 'Row 2'] },
                { header: 'Column 2', rows: ['Row 3', 'Row 4'] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Column 1', value: 'Row 1\nRow 2', inline: true },
                { name: 'Column 2', value: 'Row 3\nRow 4', inline: true },
                { name: ' ', value: ' ', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });

        it('should correctly parse three columns with rows', () =>
        {
            const input: TableColumn[] = [
                { header: 'Column 1', rows: ['Row 1', 'Row 2'] },
                { header: 'Column 2', rows: ['Row 3', 'Row 4'] },
                { header: 'Column 3', rows: ['Row 5', 'Row 6'] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Column 1', value: 'Row 1\nRow 2', inline: true },
                { name: 'Column 2', value: 'Row 3\nRow 4', inline: true },
                { name: 'Column 3', value: 'Row 5\nRow 6', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });

        it('should correctly parse four columns with rows', () =>
        {
            const input: TableColumn[] = [
                { header: 'Column 1', rows: ['Row 1', 'Row 2'] },
                { header: 'Column 2', rows: ['Row 3', 'Row 4'] },
                { header: 'Column 3', rows: ['Row 5', 'Row 6'] },
                { header: 'Column 4', rows: ['Row 7', 'Row 8'] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Column 1', value: 'Row 1\nRow 2', inline: true },
                { name: 'Column 2', value: 'Row 3\nRow 4', inline: true },
                { name: 'Column 3', value: 'Row 5\nRow 6', inline: true },
                { name: 'Column 4', value: 'Row 7\nRow 8', inline: true },
                { name: ' ', value: ' ', inline: true },
                { name: ' ', value: ' ', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });

        it('should correctly parse two columns with one row greater than the max length', () =>
        {
            const maxLengthString = new Array(MAX_EMBED_FIELD_VALUE_LENGTH).join('a');
            const input: TableColumn[] = [
                { header: 'Column 1', rows: ['Row 1', 'Row 2'] },
                { header: 'Column 2', rows: [maxLengthString, maxLengthString] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Column 1', value: 'Row 1\nRow 2', inline: true },
                { name: 'Column 2', value: maxLengthString, inline: true },
                { name: ' ', value: ' ', inline: true },
                { name: ' ', value: ' ', inline: true },
                { name: ' ', value: maxLengthString, inline: true },
                { name: ' ', value: ' ', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });

        it('should correctly parse two columns if only one column has empty rows', () =>
        {
            const input: TableColumn[] = [
                { header: 'Column 1', rows: ['Row 1', ''] },
                { header: 'Column 2', rows: [] },
            ];

            const result = parseTableColumnsToFields(input);

            const expectedResult = [
                { name: 'Column 1', value: 'Row 1\n', inline: true },
                { name: 'Column 2', value: '', inline: true },
                { name: ' ', value: ' ', inline: true },
            ];
            expect(result).toEqual(expectedResult);
        });
    });
});
