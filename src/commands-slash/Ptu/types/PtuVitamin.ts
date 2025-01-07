export enum PtuVitaminEnhancedStat
{
    HP = 'HP',
    Attack = 'Attack',
    Defense = 'Defense',
    SpecialAttack = 'Special Attack',
    SpecialDefense = 'Special Defense',
    Speed = 'Speed',
    TutorPoints = 'Tutor Points',
    MoveFrequency = 'Move’s Frequency',
}

export class PtuVitamin
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