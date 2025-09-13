export class NwodDreadPower
{
    public name: string;
    public cost: string | undefined;
    public types: string[] | undefined;
    public pageNumber: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            cost,
            typesCsv,
            pageNumber,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.cost = (cost && cost.trim() !== '--') ? cost.trim() : undefined;
        this.types = (typesCsv)
            ? typesCsv.split(',').map(value => value.trim())
            : undefined;
        this.pageNumber = pageNumber.trim();
        this.effect = effect.trim();
    }
}
