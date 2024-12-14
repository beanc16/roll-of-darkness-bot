export enum BerryTier
{
    OnePlus = '1+',
    One = '1',
    TwoPlus = '2+',
    Two = '2',
    Three = '3',
}

export class PtuBerry
{
    public name: string;
    public cost: number | undefined;
    public tier: BerryTier;
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            unparsedCost,
            tier,
            description,
        ] = input;

        // Parse numbers
        const cost = parseInt(unparsedCost, 10);

        // Base values
        this.name = name;
        this.cost = (!Number.isNaN(cost)) ? cost : undefined;
        this.tier = tier as BerryTier;
        this.description = description;
    }
}
