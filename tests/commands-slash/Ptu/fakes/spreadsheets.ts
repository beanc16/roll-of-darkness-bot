export function getFakeSpreadsheetId(index?: number): string
{
    const indexStr = (index !== undefined)
        ? `-${index}`
        : '';

    return `test-spreadsheet-id${indexStr}`;
}

export function getFakeSpreadsheetIds(numOfIds: number): string[]
{
    const result = Array.from(
        { length: numOfIds },
        (_, index) => getFakeSpreadsheetId(index),
    );

    return result;
}
