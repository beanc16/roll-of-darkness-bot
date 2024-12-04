export enum HeldItemType
{
    Normal = 'Normal',
    Mega = 'Mega',
    Badge = 'Badge',
}

export class PtuHeldItem
{
    public name: string;
    public cost: number | undefined;
    public type: HeldItemType;
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            unparsedCost,
            type,
            description,
        ] = input;

        // Parse numbers
        const cost = parseInt(unparsedCost, 10);

        // Base values
        this.name = name;
        this.cost = (!Number.isNaN(cost)) ? cost : undefined;
        this.type = type as HeldItemType;
        this.description = description;
    }
}
