class JsonPrettifierService
{

    constructor()
    {
        this._jsonArrayStringBeginning = '```json\n[\n';
        this._jsonArrayStringEnding = ']\n```';
    }

    getArrayOfObjectsAsString(arrayOfObjects)
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

    getArrayOfStringsAsString(arrayOfStrings)
    {
        const result = arrayOfStrings.reduce(function (acc, cur)
        {
            acc += `\t"${cur}",\n`;
            return acc;
        }, this._jsonArrayStringBeginning) + this._jsonArrayStringEnding;

        return result;
    }
}



module.exports = JsonPrettifierService;
