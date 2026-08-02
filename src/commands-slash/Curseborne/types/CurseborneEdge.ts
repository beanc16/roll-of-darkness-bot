import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneEdge extends BaseCurseborneModel
{
    public name: string;
    public dotsAvailable: string;
    public prerequisites?: string[];
    public type: string;
    public effect: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            dotsAvailable = '',
            prerequisites = '',
            type = '',
            effect = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.dotsAvailable = dotsAvailable.trim();
        this.prerequisites = prerequisites.trim() === '--'
            ? undefined
            : CurseborneEdge.toArray(prerequisites);
        this.type = type.trim();
        this.effect = effect.trim();
    }
}
