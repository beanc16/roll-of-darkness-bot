export class NwodNumina
{
    public name: string;
    public cost: string | undefined;
    public roll: string | undefined;
    public types: string[] | undefined;
    public isReaching: boolean;
    public pageNumber: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            cost,
            roll,
            typesCsv,
            isReachingUnparsed,
            pageNumber,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.cost = (cost && cost.trim() !== '--') ? cost.trim() : undefined;
        this.roll = (roll && roll.trim() !== '--') ? roll.trim() : undefined;
        this.types = (typesCsv)
            ? typesCsv.split(',').map(value => value.trim())
            : undefined;
        this.isReaching = (isReachingUnparsed.toLowerCase() === 'true');
        this.pageNumber = pageNumber.trim();
        this.effect = effect.trim();
    }
}
