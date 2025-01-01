export class PtuGiftBlessing
{
    public name: string;
    public patron: string;
    public prerequisites: string;
    public frequency: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            patron,
            prerequisites,
            frequency,
            effect,
        ] = input;

        // Base values
        this.name = name;
        this.patron = patron;
        this.prerequisites = prerequisites;
        this.frequency = frequency;
        this.effect = effect;
    }
}
