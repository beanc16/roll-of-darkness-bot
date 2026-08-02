export enum HealingItemType
{
    Healing = 'Healing',
    Status = 'Status',
    MedicalSupply = 'Medical Supply',
}

export class PtuHealingItem
{
    public name: string;
    public cost: number | undefined;
    public type: HealingItemType;
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
        this.type = type as HealingItemType;
        this.description = description;
    }
}
