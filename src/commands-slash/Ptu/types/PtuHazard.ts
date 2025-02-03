export class PtuHazard
{
    public name: string;
    public description: string;
    public associatedMoves?: string[];
    public associatedAbilities?: string[];

    constructor(input: string[])
    {
        const [
            name,
            description,
            associatedMoves,
            associatedAbilities,
        ] = input;

        // Base values
        this.name = name;
        this.description = description;
        this.associatedMoves = associatedMoves?.split(',')?.map(value => value.trim());
        this.associatedAbilities = associatedAbilities?.split(',')?.map(value => value.trim());
    }
}
