export class CurseborneTrick
{
    public name: string;
    public hits: string;
    public description: string;
    public formattedDescription: string;

    constructor(input: string[])
    {
        const [
            name,
            hits,
            description,
            formattedDescription,
        ] = input;

        // Base values
        this.name = name;
        this.hits = hits;
        this.description = description;
        this.formattedDescription = formattedDescription;
    }
}
