export class PtuEdge
{
    public name: string;
    public prerequisites: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            prerequisites,
            effect,
        ] = input;

        // Base values
        this.name = name;
        this.prerequisites = prerequisites;
        this.effect = effect;
    }
}
