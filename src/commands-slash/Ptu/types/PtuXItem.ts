export class PtuXItem
{
    public name: string;
    public cost: number;
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            unparsedCost,
            description,
        ] = input;

        // Parse numbers
        const cost = parseInt(unparsedCost, 10);

        // Base values
        this.name = name;
        this.cost = cost;
        this.description = description;
    }
}
