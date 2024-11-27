export class PtuFeature
{
    public name: string;
    public tags: string;
    public prerequisites: string;
    public frequencyAndAction: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            tags,
            prerequisites,
            frequencyAndAction,
            effect,
        ] = input;

        // Base values
        this.name = name;
        this.tags = tags;
        this.prerequisites = prerequisites;
        this.frequencyAndAction = frequencyAndAction;
        this.effect = effect;
    }
}
