import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneTag extends BaseCurseborneModel
{
    public name: string;
    public type: string;
    public effect: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            type = '',
            effect = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.type = type.trim();
        this.effect = effect.trim();
    }
}
