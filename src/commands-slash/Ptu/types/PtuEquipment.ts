export enum PtuEquipmentSlot
{
    Hands = 'Hands',
    MainHand = 'Main Hand',
    OffHand = 'Off-Hand',
    Head = 'Head',
    Body = 'Body',
    Feet = 'Feet',
    Accessory = 'Accessory',
    Consumable = 'Consumable',
    Item = 'Item',
}

export class PtuEquipment
{
    public name: string;
    public cost?: string;
    public slots: PtuEquipmentSlot[];
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            cost,
            slots,
            description,
        ] = input;

        // Base values
        this.name = name;
        this.cost = (cost !== '--') ? cost : undefined;
        this.slots = slots.split('+').map(value => value.trim() as PtuEquipmentSlot);
        this.description = description;
    }
}
