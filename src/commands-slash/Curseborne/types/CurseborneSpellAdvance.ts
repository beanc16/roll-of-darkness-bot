import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneSpellAdvance extends BaseCurseborneModel
{
    public name: string;
    public prerequisites: string[];
    public effect: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            prerequisites = '',
            effect = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.prerequisites = CurseborneSpellAdvance.toArray(prerequisites);
        this.effect = effect.trim();
    }
}
