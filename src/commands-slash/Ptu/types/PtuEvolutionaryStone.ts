export class PtuEvolutionaryStone
{
    public name: string;
    public cost: number | undefined;
    public pokemonToEvolve: string[];

    constructor(input: string[])
    {
        const [
            name,
            unparsedCost,
            description,
        ] = input;

        // Parse numbers
        const cost = parseInt(unparsedCost, 10);

        // Parse pokemon to evolve (this value looks something like:
        // "Evolves Vulpix, Growlithe, Eevee, Pansear")
        const pokemonToEvolve = description.replace('Evolves', '')
            .trim()
            .split(',')
            .map(value => value.trim());

        // Base values
        this.name = name;
        this.cost = (!Number.isNaN(cost)) ? cost : undefined;
        this.pokemonToEvolve = pokemonToEvolve;
    }
}
