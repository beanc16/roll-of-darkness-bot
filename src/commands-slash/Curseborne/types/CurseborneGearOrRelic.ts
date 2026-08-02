import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneGearOrRelic extends BaseCurseborneModel
{
    public name: string;
    public dots: string[];
    public type: string;
    public enhancement?: string;
    public tags?: string[];
    public description: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            dots = '',
            type = '',
            enhancement = '',
            tags = '',
            description = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.dots = CurseborneGearOrRelic.toArray(dots);
        this.type = type.trim();
        this.enhancement = enhancement === '--'
            ? undefined
            : enhancement.trim();
        this.tags = tags === '--'
            ? undefined
            : CurseborneGearOrRelic.toArray(tags);
        this.description = description.trim();
    }
}
