export class NwodCondition
{
    public name: string;
    public description: string;
    public resolution: string;
    public beat: string | undefined;
    public possibleSources: string | undefined;

    constructor(input: string[])
    {
        const [
            name,
            description,
            resolution,
            beat,
            possibleSources,
        ] = input;

        // Base values
        this.name = name.trim();
        this.description = description.trim();
        this.resolution = resolution.trim();
        this.beat = (beat && beat.trim() !== '--') ? beat.trim() : undefined;
        this.possibleSources = (possibleSources && possibleSources.trim() !== '--')
            ? possibleSources.trim()
            : undefined;
    }
}