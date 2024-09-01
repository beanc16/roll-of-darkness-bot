import { DiceService } from './DiceService.js';

export class DiceLiteService
{
    #diceService: DiceService;

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
        this.#diceService = new DiceService({
            sides,
            count,
            rerollOnGreaterThanOrEqualTo,
        });
    }

    roll(): number[]
    {
        const dicePoolGroup = this.#diceService.roll();
        const [rollResults] = dicePoolGroup.dicepoolResults;
        return rollResults;
    }
}
