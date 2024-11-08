import { DiceService, RollOptions } from './DiceService.js';

export class DiceLiteService
{
    private diceService: DiceService;

    constructor({
        sides,
        count,
        rerollOnGreaterThanOrEqualTo = sides + 1,
    }: {
        sides: number;
        count: number;
        rerollOnGreaterThanOrEqualTo?: number;
    })
    {
        this.diceService = new DiceService({
            sides,
            count,
            rerollOnGreaterThanOrEqualTo,
        });
    }

    roll(options: RollOptions = {}): number[]
    {
        const dicePoolGroup = this.diceService.roll(options);
        const [rollResults] = dicePoolGroup.dicepoolResults;
        return rollResults;
    }
}
