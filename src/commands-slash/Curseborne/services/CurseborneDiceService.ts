import { DiceService } from '../../../services/DiceService.js';
import rollConstants from '../../../constants/roll.js';
import { CurseborneDicePool } from './CurseborneDicePool.js';

export class CurseborneDiceService
{
    private diceService: DiceService;
    public twoSuccessesOn: number;
    public enhancements: number;

    constructor({
        count = rollConstants.defaultParams.count,
        twoSuccessesOn = rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo,
        enhancements = 0,
    }: {
        count?: number | null;
        twoSuccessesOn?: number;
        enhancements?: number;
    } = rollConstants.defaultParams)
    {
        this.diceService = new DiceService({
            count,
            successOnGreaterThanOrEqualTo: 8,   // Always succeed on 8 or higher
            sides: 10,                          // Always use 10-sided die
            extraSuccesses: enhancements,
            // Never use any of the following:
            rerollOnGreaterThanOrEqualTo: 100,
            diceToReroll: 0,
            isRote: false,
            isAdvancedAction: false,
        });

        this.twoSuccessesOn = twoSuccessesOn;
        this.enhancements = enhancements;
    }

    public roll(): {
        numOfSuccesses: number;
        rollResults: number[];
    }
    {
        const dicePoolGroup = this.diceService.roll();

        const result = dicePoolGroup.reduce<{
            numOfSuccesses: number;
            rollResults: number[];
        }>((acc, cur) => {
            const dicePool = new CurseborneDicePool({
                dicePool: cur,
                twoSuccessesOn: this.twoSuccessesOn,
            });

            acc.numOfSuccesses += dicePool.numOfSuccesses;
            acc.rollResults.push(...dicePool.rollResults);
            return acc;
        }, {
            numOfSuccesses: 0,
            rollResults: [],
        });

        return result;
    }
}
