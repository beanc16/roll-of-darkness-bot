import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneMotif extends BaseCurseborneModel
{
    public name: string;
    public effect: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            effect = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.effect = effect.trim();
    }
}
