import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneStatus extends BaseCurseborneModel
{
    public name: string;
    public types?: string[];
    public effect: string;
    public resolution: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            types = '',
            effect = '',
            resolution = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.types = types === '--'
            ? undefined
            : CurseborneStatus.toArray(types);
        this.effect = effect.trim();
        this.resolution = resolution.trim();
    }
}
