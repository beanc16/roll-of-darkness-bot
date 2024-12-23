import type { NwodTiltType } from './types.js';

export class NwodTilt
{
    public name: string;
    public effect: string;
    public types: NwodTiltType[];
    public causingTheTilt: string;
    public endingTheTilt: string;
    public pageNumber: string;

    constructor(input: string[])
    {
        const [
            name,
            effect,
            unparsedTypes,
            causingTheTilt,
            endingTheTilt,
            pageNumber,
        ] = input;

        // Base values
        this.name = name.trim();
        this.effect = effect.trim();
        this.types = unparsedTypes.split('or').map(type => type.trim() as NwodTiltType);
        this.causingTheTilt = causingTheTilt.trim();
        this.endingTheTilt = endingTheTilt.trim();
        this.pageNumber = pageNumber.trim();
    }
}
