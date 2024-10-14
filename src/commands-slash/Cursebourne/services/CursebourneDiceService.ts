import { DiceService } from '../../../services/DiceService.js';
import rollConstants from '../../../constants/roll.js';
import { CursebourneDicePool } from '../models/CursebourneDicePool.js';

export class CursebourneDiceService
{
    private diceService: DiceService;
    public twoSuccessesOn: number;

    constructor({
        count = rollConstants.defaultParams.count,
        twoSuccessesOn = rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo,
    }: {
        count?: number | null;
        twoSuccessesOn?: number;
    } = rollConstants.defaultParams)
    {
        this.diceService = new DiceService({
            count,
            successOnGreaterThanOrEqualTo: 8,   // Always succeed on 8 or higher
            sides: 10,                          // Always use 10-sided die
            // Never use any of the following:
            rerollOnGreaterThanOrEqualTo: 100,
            exceptionalOn: 100,
            diceToReroll: 0,
            isRote: false,
            extraSuccesses: 0,
            isAdvancedAction: false,
            canBeDramaticFailure: false,
        });

        this.twoSuccessesOn = twoSuccessesOn;
    }

    public roll(): {
        numOfSuccesses: number;
        rollResults: number[];
    }
    {
        const dicePoolGroup = this.diceService.roll();

        return dicePoolGroup.reduce<{
            numOfSuccesses: number;
            rollResults: number[];
        }>((acc, cur) => {
            const dicePool = new CursebourneDicePool({
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
    }
}
