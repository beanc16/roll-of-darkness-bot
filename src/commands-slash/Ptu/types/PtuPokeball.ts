import { PokeballType } from './pokeballType.js';

export class PtuPokeball
{
    public name: string;
    public cost: number | undefined;
    public modifier: string | undefined;
    public type: PokeballType;
    public description: string;

    constructor(input: string[])
    {
        const [
            name,
            unparsedCost,
            modifier,
            type,
            description,
        ] = input;

        // Parse numbers
        const cost = parseInt(unparsedCost, 10);

        // Base values
        this.name = name;
        this.cost = (!Number.isNaN(cost)) ? cost : undefined;
        this.modifier = (modifier !== '--') ? modifier : undefined;
        this.type = type as PokeballType;
        this.description = description;
    }
}
