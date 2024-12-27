export class GeistHaunt
{
    public name: string;
    public dots: string;
    public activationRoll?: string;
    public associatedHaunt?: string;
    public associatedPowers?: string[];
    public cost?: string;
    public action?: string;
    public pageNumber: string;
    public effect: string;
    public enhancements?: string;

    constructor(input: string[])
    {
        const [
            name,
            dots,
            activationRoll,
            associatedHaunt,
            unparsedAssociatedPowers,
            cost,
            action,
            pageNumber,
            effect,
            enhancements,
        ] = input;

        // Base values
        this.name = name.trim();
        this.dots = dots.trim();
        this.activationRoll = (activationRoll) ? activationRoll.trim() : undefined;
        this.associatedHaunt = (associatedHaunt) ? associatedHaunt.trim() : undefined;
        this.associatedPowers = (unparsedAssociatedPowers)
            ? unparsedAssociatedPowers.split('\n').map(power => power.trim())
            : undefined;
        this.cost = (cost) ? cost.trim() : undefined;
        this.action = (action) ? action.trim() : undefined;
        this.pageNumber = pageNumber.trim();
        this.effect = effect.trim();
        this.enhancements = (enhancements) ? enhancements.trim() : undefined;
    }
}
