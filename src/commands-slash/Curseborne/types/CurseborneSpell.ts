import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneSpell extends BaseCurseborneModel
{
    public name: string;
    public availableTo: string[];
    public cost: string;
    public types: string[];
    public attunements: string[];
    public effect: string;
    public advanceNames: string[];

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            availableTo = '',
            cost = '',
            types = '',
            attunements = '',
            effect = '',
            advanceNames = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.availableTo = CurseborneSpell.toArray(availableTo);
        this.cost = cost.trim();
        this.types = CurseborneSpell.toArray(types);
        this.attunements = CurseborneSpell.toArray(attunements);
        this.effect = effect.trim();
        this.advanceNames = CurseborneSpell.toArray(advanceNames);
    }
}
