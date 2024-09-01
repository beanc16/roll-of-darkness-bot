export default class JsonPrettifierService
{
    private _jsonArrayStringBeginning: string;
    private _jsonArrayStringEnding: string;

    constructor()
    {
        this._jsonArrayStringBeginning = '```json\n[\n';
        this._jsonArrayStringEnding = ']\n```';
    }

    getArrayOfObjectsAsString<Object extends Record<any, any>>(arrayOfObjects: Object[]): string
    {
        const result = arrayOfObjects.reduce(function (acc, cur)
        {
            acc += Object.entries(cur).reduce(function (acc2, [key, value])
            {
                // This assumes all keys and values are strings
                acc2 += `\t\t"${key}": "${value}",\n`;
                return acc2;
            }, '\t{\n') + '\t},\n';

            return acc;
        }, this._jsonArrayStringBeginning) + this._jsonArrayStringEnding;

        return result;
    }

    getArrayOfStringsAsString(arrayOfStrings: string[]): string
    {
        const result = arrayOfStrings.reduce(function (acc, cur)
        {
            acc += `\t"${cur}",\n`;
            return acc;
        }, this._jsonArrayStringBeginning) + this._jsonArrayStringEnding;

        return result;
    }
}
