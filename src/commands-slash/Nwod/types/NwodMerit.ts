import type { MeritType } from './types.js';

export class NwodMerit
{
    public name: string;
    public dots: string;
    public types: MeritType[];
    public prerequisites: string | undefined;
    public activationRoll: string | undefined;
    public action: string | undefined;
    public pageNumber: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            dots,
            unparsedTypes,
            prerequisites,
            activationRoll,
            action,
            pageNumber,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.dots = dots.trim();
        this.types = unparsedTypes.split(',').map(type => type.trim() as MeritType);
        this.prerequisites = (prerequisites && prerequisites.trim() !== '--') ? prerequisites.trim() : undefined;
        this.activationRoll = (activationRoll && activationRoll !== '--') ? activationRoll.trim() : undefined;
        this.action = (action && action !== '--') ? action.trim() : undefined;
        this.pageNumber = pageNumber.trim();
        this.effect = effect.trim();
    }
}
