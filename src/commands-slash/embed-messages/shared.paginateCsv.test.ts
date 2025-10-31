import { paginateCsv } from './shared.js';

describe('function: paginateCsv', () =>
{
    describe.each([
        ['\\n', '\n'],
        [';', ';'],
        ['||', '||'],
    ])(`delimiter: '%s'`, (_, delimiter) =>
    {
        it('should return a single page when input is under the character limit', () =>
        {
            const input = [
                'header1,header2,header3',
                'row1col1,row1col2,row1col3',
                'row2col1,row2col2,row2col3',
            ].join(delimiter);

            const result = paginateCsv({
                input,
                delimiter,
                maxChars: 2000,
            });

            expect(result).toEqual([input]);
            expect(result.length).toBe(1);
        });

        it('should split into multiple pages when input exceeds character limit', () =>
        {
            const row = 'A'.repeat(1500);
            const input = Array.from({ length: 3 }, () => row).join(delimiter);

            const result = paginateCsv({
                input,
                delimiter,
                maxChars: 2000,
            });

            expect(result.length).toBe(3);
            expect(result).toEqual([
                row,
                row,
                row,
            ]);
        });

        it('should handle empty input string', () =>
        {
            const result = paginateCsv({
                input: '',
                delimiter,
                maxChars: 2000,
            });

            expect(result).toEqual(['']);
        });

        it('should respect custom maxChars limit', () =>
        {
            const input = [
                'A'.repeat(50),
                'B'.repeat(50),
                'C'.repeat(50),
            ].join(delimiter);

            const result = paginateCsv({
                input,
                delimiter,
                maxChars: 100,
            });

            result.forEach((page) =>
            {
                expect(page.length).toBeLessThanOrEqual(100);
            });
        });

        it('should handle single row that exceeds maxChars', () =>
        {
            const longRow = 'A'.repeat(3000);

            const result = paginateCsv({
                input: longRow,
                delimiter,
                maxChars: 2000,
            });

            expect(result.length).toBe(1);
            expect(result).toEqual([longRow]);
        });

        it('should pack as many rows as possible into each page', () =>
        {
            const row = 'A'.repeat(500);
            const input = Array.from({ length: 10 }, () => row).join(delimiter);

            const result = paginateCsv({
                input,
                delimiter,
                maxChars: 2000,
            });

            // With slightly less than 500 char rows + char delimiter length,
            // we can fit 3 rows per page
            expect(result.length).toBe(4); // 3 + 3 + 3 + 1
            expect(result[0].split(delimiter).length).toBe(3);
            expect(result[1].split(delimiter).length).toBe(3);
            expect(result[2].split(delimiter).length).toBe(3);
            expect(result[3].split(delimiter).length).toBe(1);
        });

        it('should handle input with only delimiters', () =>
        {
            const input = Array.from({ length: 3 }, () => delimiter).join('');

            const result = paginateCsv({
                input,
                delimiter,
                maxChars: 2000,
            });

            expect(result).toEqual([input]);
        });

        it('should preserve row order across pages', () =>
        {
            const rows = ['row1', 'row2', 'row3', 'row4', 'row5'];
            const input = rows.join(delimiter);

            const result = paginateCsv({
                input,
                delimiter,
                maxChars: 15,
            });

            const reconstructed = result.join(delimiter).split(delimiter);
            expect(reconstructed).toEqual(rows);
        });

        it('should handle CSV with headers correctly', () =>
        {
            const header = 'id,name,email,phone';
            const row = 'A'.repeat(1000);
            const input = `${header}${delimiter}`
                + Array.from({ length: 3 }, () => row).join(delimiter);

            const result = paginateCsv({
                input,
                delimiter,
                maxChars: 2000,
            });

            // First page should start with header
            expect(result[0].startsWith(header)).toBe(true);
        });
    });
});
