import {
    createEmbedMessageDescriptionAndPage,
    CreateEmbedMessageDescriptionAndPageOptions,
    type PageData,
    type TableColumn,
} from '../../../../src/commands-slash/embed-messages/shared.js';
import { MAX_EMBED_DESCRIPTION_LENGTH } from '../../../../src/constants/discord.js';

describe('function: createEmbedMessageDescriptionAndPage', () =>
{
    let pageData: PageData;

    beforeEach(() =>
    {
        pageData = {
            pages: [''],
            curPage: 0,
            tableColumns: [],
        };
    });

    it('should handle cases where tableData is empty or "--"', () =>
    {
        const options: CreateEmbedMessageDescriptionAndPageOptions = {
            lines: ['Line 1'],
            pageData,
            tableData: '--',
            index: 0,
        };

        const result = createEmbedMessageDescriptionAndPage(options);

        const expectedResult: TableColumn[] = [];
        expect(result.tableColumns).toEqual(expectedResult);
    });

    it('should add lines to the current page description if within limit', () =>
    {
        const options: CreateEmbedMessageDescriptionAndPageOptions = {
            lines: ['Line 1', 'Line 2'],
            pageData,
            index: 0,
        };

        const result = createEmbedMessageDescriptionAndPage(options);

        const expectedResult: PageData = {
            pages: ['Line 1\nLine 2'],
            curPage: 0,
            tableColumns: [],
        };
        expect(result).toEqual(expectedResult);
    });

    it('should create a new page when pageData exceeds the max limit', () =>
    {
        const options: CreateEmbedMessageDescriptionAndPageOptions = {
            lines: ['A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH)],
            pageData: {
                ...pageData,
                pages: ['A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH - 1)],
            },
            index: 1,
        };

        const result = createEmbedMessageDescriptionAndPage(options);

        const expectedResult: PageData = {
            pages: [
                'A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH - 1),
                'A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH),
            ],
            curPage: 1,
            tableColumns: [],
        };
        expect(result).toEqual(expectedResult);
    });

    it('should create a new page when lines exceed the max limit', () =>
    {
        const options: CreateEmbedMessageDescriptionAndPageOptions = {
            lines: [
                'A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH),
                `Description:\n\`\`\`\nSome Description\`\`\``,
                'A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH - 40),
            ],
            pageData: {
                ...pageData,
            },
            index: 1,
        };

        const result = createEmbedMessageDescriptionAndPage(options);

        const expectedResult: PageData = {
            pages: [
                'A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH),
                [
                    `Description:\n\`\`\`\nSome Description\`\`\``,
                    'A'.repeat(MAX_EMBED_DESCRIPTION_LENGTH - 40),
                ].join('\n'),
            ],
            curPage: 1,
            tableColumns: [],
        };
        expect(result).toEqual(expectedResult);
    });

    it('should separate entries with a blank line if not the first entry on the page', () =>
    {
        const options: CreateEmbedMessageDescriptionAndPageOptions = {
            lines: ['Second entry'],
            pageData: {
                ...pageData,
                pages: ['First entry'],
                curPage: 0,
            },
            index: 1,
        };

        const result = createEmbedMessageDescriptionAndPage(options);

        const expectedResult: PageData = {
            pages: ['First entry\nSecond entry'],
            curPage: 0,
            tableColumns: [],
        };
        expect(result).toEqual(expectedResult);
    });

    it('should add table data to tableColumns if provided', () =>
    {
        const options: CreateEmbedMessageDescriptionAndPageOptions = {
            lines: ['Line 1'],
            pageData,
            tableData: 'Header 1|Row 1|Row 2\nHeader 2|Row A|Row B',
            index: 0,
        };

        const result = createEmbedMessageDescriptionAndPage(options);

        const expectedResult: TableColumn[] = [
            { header: 'Header 1', rows: ['Row 1', 'Row 2'] },
            { header: 'Header 2', rows: ['Row A', 'Row B'] },
        ];
        expect(result.tableColumns).toEqual(expectedResult);
    });

    it('should not modify the original pageData object', () =>
    {
        const options: CreateEmbedMessageDescriptionAndPageOptions = {
            lines: pageData.pages,
            pageData,
            tableData: pageData.tableColumns?.join('|'),
            index: pageData.curPage,
        };

        const result = createEmbedMessageDescriptionAndPage(options);

        expect(result).not.toBe(pageData);
        expect(pageData.tableColumns).toEqual([]);
    });
});
