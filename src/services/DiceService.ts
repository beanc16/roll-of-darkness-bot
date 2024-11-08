import rollConstants from '../constants/roll.js';
import { DicePoolGroup } from '../models/DicePoolGroup.js';
import { DicePool } from '../models/DicePool.js';
import { Roll } from '../types/rolls.js';

export interface RollOptions
{
    shouldRollMaxOnSecondHalfOfDicepool?: boolean;
}

export class DiceService
{
    public sides: number;
    public count: number;
    public rerollOnGreaterThanOrEqualTo: number;
    public successOnGreaterThanOrEqualTo: number;
    public exceptionalOn: number;
    public diceToReroll: number;
    public canBeDramaticFailure: boolean;
    public isRote: boolean;
    public isAdvancedAction: boolean;
    public extraSuccesses: number;

    constructor({
        sides = rollConstants.defaultParams.sides,
        count = rollConstants.defaultParams.count,
        rerollOnGreaterThanOrEqualTo = rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo,
        successOnGreaterThanOrEqualTo = rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
        exceptionalOn = rollConstants.defaultParams.exceptionalOn,
        diceToReroll = rollConstants.defaultParams.diceToReroll,
        canBeDramaticFailure = rollConstants.defaultParams.canBeDramaticFailure,
        isRote = rollConstants.defaultParams.isRote,
        isAdvancedAction = rollConstants.defaultParams.isAdvancedAction,
        extraSuccesses = rollConstants.defaultParams.extraSuccesses,
    }: {
        sides?: number;
        count?: number | null;
        rerollOnGreaterThanOrEqualTo?: number;
        successOnGreaterThanOrEqualTo?: number;
        exceptionalOn?: number | null;
        diceToReroll?: number | null;
        canBeDramaticFailure?: boolean;
        isRote?: boolean | null;
        isAdvancedAction?: boolean | null;
        extraSuccesses?: number | null;
    } = rollConstants.defaultParams)
    {
        this.sides = sides ?? rollConstants.defaultParams.sides;
        this.count = count ?? rollConstants.defaultParams.count;
        this.rerollOnGreaterThanOrEqualTo = rerollOnGreaterThanOrEqualTo ?? rollConstants.defaultParams.rerollOnGreaterThanOrEqualTo;
        this.successOnGreaterThanOrEqualTo = successOnGreaterThanOrEqualTo ?? rollConstants.defaultParams.successOnGreaterThanOrEqualTo;
        this.exceptionalOn = exceptionalOn ?? rollConstants.defaultParams.exceptionalOn;
        this.diceToReroll = diceToReroll ?? rollConstants.defaultParams.diceToReroll;
        this.canBeDramaticFailure = canBeDramaticFailure ?? rollConstants.defaultParams.canBeDramaticFailure
        this.isRote = isRote ?? rollConstants.defaultParams.isRote;
        this.isAdvancedAction = isAdvancedAction ?? rollConstants.defaultParams.isAdvancedAction;
        this.extraSuccesses = extraSuccesses ?? rollConstants.defaultParams.extraSuccesses;
    }

    public roll(options: RollOptions = {}): DicePoolGroup
    {
        const dicePoolGroup = new DicePoolGroup({
            dicepool: this.rollDicepool(options),
        });

        if (this.isAdvancedAction)
        {
            dicePoolGroup.push(this.rollDicepool(options));
        }

        return dicePoolGroup;
    }

    public rollDicepool({
        shouldRollMaxOnSecondHalfOfDicepool = false,
    }: RollOptions = {}): DicePool
    {
        const dicePool = new DicePool({
            exceptionalOn: this.exceptionalOn,
            successOnGreaterThanOrEqualTo: this.successOnGreaterThanOrEqualTo,
            canBeDramaticFailure: this.canBeDramaticFailure,
            extraSuccesses: this.extraSuccesses,
        });

        for (let i = 0; i < this.count; i++)
        {
            const result = this.rollOne({
                shouldRollMax: (shouldRollMaxOnSecondHalfOfDicepool && i >= Math.ceil(this.count / 2)),
            });
            dicePool.push(result);
        }

        return dicePool;
    }

    public rollOne({
        isReroll = false,
        isRote = false,
        shouldRollMax = false,
    } = {}): Roll[]
    {
        const rolls = [];

        // Get a random integer between 1 and sides (inclusive)
        const randomDecimal = (!shouldRollMax)
            ? Math.random() * this.sides
            : this.sides - 1;
        const randomInteger = Math.floor(randomDecimal) + 1;

        rolls.push({
            number: randomInteger,
            isRote,
        });

        if (randomInteger >= this.rerollOnGreaterThanOrEqualTo)
        {
            for (let i = 0; i < this.diceToReroll; i++) {
                const results = this.rollOne({ isReroll: true });
                rolls.push(...results);
            }
        }

        if (!isReroll && this.isRote && randomInteger < this.successOnGreaterThanOrEqualTo)
        {
            const results = this.rollOne({
                isReroll: true,
                isRote: true,
            });
            rolls.push(...results);
        }

        return rolls;
    }
}
