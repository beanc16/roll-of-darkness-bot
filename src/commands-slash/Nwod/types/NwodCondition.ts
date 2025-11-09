export class NwodCondition
{
    public name: string;
    public description: string;
    public resolution: string;
    public beat: string | undefined;
    public possibleSources: string | undefined;
    public pageNumber: string;
    public clarityConditionTags: string[] | undefined;
    public types: string[] | undefined;

    constructor(input: string[])
    {
        const [
            name,
            description,
            resolution,
            beat,
            possibleSources,
            pageNumber,
            clarityCondition,
            type,
        ] = input;

        // Base values
        this.name = name.trim();
        this.description = description.trim();
        this.resolution = resolution.trim();
        this.beat = (beat && beat.trim() !== '--') ? beat.trim() : undefined;
        this.possibleSources = (possibleSources && possibleSources.trim() !== '--')
            ? possibleSources.trim()
            : undefined;
        this.pageNumber = pageNumber.trim();
        this.clarityConditionTags = (clarityCondition)
            ? clarityCondition.split(',').map(value => value.trim())
            : undefined;
        this.types = (type)
            ? type.split(',').map(value => value.trim())
            : undefined;
    }
}
