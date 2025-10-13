import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CurseborneTrick extends BaseCurseborneModel
{
    public name: string;
    public hits: string;
    public tags: string[];
    public description: string;
    public formattedDescription: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            hits = '',
            tags = '',
            description = '',
            formattedDescription = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.hits = hits.trim();
        this.tags = CurseborneTrick.toArray(tags);
        this.description = description.trim();
        this.formattedDescription = formattedDescription.trim();
    }
}
