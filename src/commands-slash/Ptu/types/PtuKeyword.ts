export class PtuKeyword
{
    public name: string;
    public description: string;

    /*
    tableData is a string formatted as a CSV, where each CSV row maps to a table column with a line break where each comma is:
    ColumnHeader1|value1|value2|value3
    ColumnHeader2|value4|value5|value6

    This should then be displayed as:
    **ColumnHeader1**   **ColumnHeader2**
    value1              value4
    value2              value5
    value3              value6
    */
    public tableData: string;

    constructor(input: string[])
    {
        const [
            name,
            description,
            tableData,
        ] = input;

        // Base values
        this.name = name;
        this.description = description;
        this.tableData = tableData;
    }
}
