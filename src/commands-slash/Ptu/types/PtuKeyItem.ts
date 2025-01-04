export class PtuKeyItem
{
    public name: string;
    public cost?: number | string;
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            unparsedCost,
            description,
        ] = input;

        // Parse numbers
        const cost = PtuKeyItem.parseCost(name, unparsedCost);

        // Base values
        this.name = name;
        this.cost = cost;
        this.description = description;
    }

    private static parseCost(name: string, unparsedCost: string): number | string | undefined
    {
        if (unparsedCost === '--')
        {
            return undefined;
        }

        const cost = parseInt(unparsedCost, 10);

        if (Number.isNaN(cost) || name.toLowerCase() === 'tent')
        {
            return unparsedCost;
        }

        return cost;
    }
}
