import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneArtifact extends BaseCurseborneModel
{
    public name: string;
    public dots: string;
    public effect: string;
    public special: string;
    public obligation: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            dots = '',
            effect = '',
            special = '',
            obligation = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.dots = dots.trim();
        this.effect = effect.trim();
        this.special = special.trim();
        this.obligation = obligation.trim();
    }
}
