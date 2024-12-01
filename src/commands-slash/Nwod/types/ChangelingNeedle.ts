export class ChangelingNeedle
{
    public name: string;
    public pageNumber: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            pageNumber,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.pageNumber = pageNumber.trim();
        this.effect = effect.trim();
    }
}
