import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneAreaEffect extends BaseCurseborneModel
{
    public name: string;
    public severity: string[];
    public effect: string;
    public consequence: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            severity = '',
            effect = '',
            consequence = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.severity = CurseborneAreaEffect.toArray(severity);
        this.effect = effect.trim();
        this.consequence = consequence.trim();
    }
}
