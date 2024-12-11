import type { ChangelingTokenType } from './types.js';

export class ChangelingToken
{
    public name: string;
    public dots: string;
    public type: ChangelingTokenType;
    public catch: string;
    public drawback: string;
    public pageNumber: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            dots,
            type,
            catchString,
            drawback,
            pageNumber,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.dots = dots.trim();
        this.type = type.trim() as ChangelingTokenType;
        this.catch = catchString.trim();
        this.drawback = drawback.trim();
        this.pageNumber = pageNumber.trim();
        this.effect = effect.trim();
    }
}
