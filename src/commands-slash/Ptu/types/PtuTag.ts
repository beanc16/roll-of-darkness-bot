export class PtuTag
{
    public name: string;
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            description,
        ] = input;

        // Base values
        this.name = name;
        this.description = description;
    }
}
