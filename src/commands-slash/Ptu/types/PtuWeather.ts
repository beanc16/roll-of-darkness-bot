export class PtuWeather
{
    public name: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            effect,
        ] = input;

        // Base values
        this.name = name;
        this.effect = effect;
    }
}
