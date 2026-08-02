import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneEquipment extends BaseCurseborneModel
{
    public name: string;
    public type: string;
    public tags: string[];
    public description: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            type = '',
            tags = '',
            description = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.type = type.trim();
        this.tags = CurseborneEquipment.toArray(tags);
        this.description = description.trim();
    }
}
