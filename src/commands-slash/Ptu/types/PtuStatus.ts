export class PtuStatus
{
    public name: string;
    public type: string;
    public isHomebrew: boolean;
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            type,
            isHomebrewUnparsed,
            description,
        ] = input;

        // Parse numbers
        const isHomebrew = (isHomebrewUnparsed.toLowerCase() === 'true')
            ? true
            : false;

        // Base values
        this.name = name;
        this.type = type;
        this.isHomebrew = isHomebrew;
        this.description = description;
    }
}
