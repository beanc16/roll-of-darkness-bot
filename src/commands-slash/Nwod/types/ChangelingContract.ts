import { ChangelingContractType } from './types.js';

export class ChangelingContract
{
    public name: string;
    public types: ChangelingContractType[];
    public cost: string;
    public loophole: string;
    public activationRoll: string | undefined;
    public action: string;
    public duration: string;
    public pageNumber: string;
    public description: string;
    public seemingBenefits: string | undefined;

    constructor(input: string[])
    {
        const [
            name,
            unparsedTypes,
            cost,
            loophole,
            activationRoll,
            action,
            duration,
            pageNumber,
            description,
            seemingBenefits,
        ] = input;

        // Base values
        this.name = name.trim();
        this.types = unparsedTypes.split(',').map(type => type.trim() as ChangelingContractType);
        this.cost = cost.trim();
        this.loophole = loophole.trim();
        this.activationRoll = (activationRoll && activationRoll.trim() !== '--') ? activationRoll.trim() : undefined;
        this.action = action.trim();
        this.duration = duration.trim();
        this.pageNumber = pageNumber.trim();
        this.description = description.trim();
        this.seemingBenefits = (seemingBenefits && seemingBenefits.trim() !== '--') ? seemingBenefits.trim() : undefined;
    }
}
