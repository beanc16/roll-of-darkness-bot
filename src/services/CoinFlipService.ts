import { DiceService } from './DiceService.js';
import { coinFlipResultsEnum } from '../constants/coinFlip.js';

export default class CoinFlipService
{
    private _diceService: DiceService;

    constructor()
    {
        this._diceService = new DiceService({
            sides: 2,
        });
    }

    flip()
    {
        const result = this._diceService.roll();

        if (result?.get(0)?.rolls[0][0].number === 1) {
            return coinFlipResultsEnum.heads;
        }

        return coinFlipResultsEnum.tails;
    }
}
