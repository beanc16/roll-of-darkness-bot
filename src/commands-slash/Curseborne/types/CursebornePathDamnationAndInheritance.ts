import { BaseCurseborneModel } from './BaseCurseborneModel.js';

export class CursebornePathDamnationAndInheritance extends BaseCurseborneModel
{
    public name: string;
    public damnation: string;
    public inheritance: string;

    constructor(input: string[])
    {
        super();

        const [
            name = '',
            damnation = '',
            inheritance = '',
        ] = input;

        // Base values
        this.name = name.trim();
        this.damnation = damnation.trim();
        this.inheritance = inheritance.trim();
    }
}
