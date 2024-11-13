import rollConstants from '../../src/constants/roll.js';
import { DicePool, DicePoolOptions } from '../../src/services/DicePool.js';
import type { Roll } from '../../src/types/rolls.js';
import { getFakeRoll } from './fakes/rolls.js';

describe('class: DicePool', () =>
{
    let dicePool: DicePool;
    let rolls: Roll[];

    beforeEach(() =>
    {
        dicePool = new DicePool();
        rolls = [
            getFakeRoll(4),
            getFakeRoll(6),
            getFakeRoll({ number: 2, isRote: true }),
            getFakeRoll({ number: 5, isRote: true }),
            getFakeRoll(1),
            getFakeRoll(3),
        ];
    });

    describe('constructor', () =>
    {
        it('should initialize with default values if none are provided', () =>
        {
            // eslint-disable-next-line @typescript-eslint/dot-notation -- This notation is necessary for private class variables
            expect(dicePool['successOnGreaterThanOrEqualTo']).toEqual(
                rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
            );

            // eslint-disable-next-line @typescript-eslint/dot-notation -- This notation is necessary for private class variables
            expect(dicePool['successOnGreaterThanOrEqualTo']).toEqual(
                rollConstants.defaultParams.successOnGreaterThanOrEqualTo,
            );

            // eslint-disable-next-line @typescript-eslint/dot-notation -- This notation is necessary for private class variables
            expect(dicePool['_rolls']).toEqual([]);
            // eslint-disable-next-line @typescript-eslint/dot-notation -- This notation is necessary for private class variables
            expect(dicePool['_numOfSuccesses']).toEqual(undefined);
        });

        it('should initialize with provided values', () =>
        {
            const expectedResult: DicePoolOptions = {
                successOnGreaterThanOrEqualTo: 5,
                extraSuccesses: 2,
            };

            const customPool = new DicePool(expectedResult);

            // eslint-disable-next-line @typescript-eslint/dot-notation -- This notation is necessary for private class variables
            expect(customPool['successOnGreaterThanOrEqualTo']).toEqual(
                expectedResult.successOnGreaterThanOrEqualTo,
            );
            // eslint-disable-next-line @typescript-eslint/dot-notation -- This notation is necessary for private class variables
            expect(customPool['extraSuccesses']).toEqual(
                expectedResult.extraSuccesses,
            );
        });
    });

    describe('get: rolls', () =>
    {
        it('should return an empty array initially', () =>
        {
            expect(dicePool.rolls).toEqual([]);
        });
    });

    describe('get: rollResults', () =>
    {
        it('should return a flat array of roll numbers', () =>
        {
            dicePool.push([rolls[0], rolls[1]]);
            dicePool.push([rolls[2]]);
            dicePool.push([rolls[3], rolls[4], rolls[5]]);

            expect(dicePool.rollResults).toEqual(
                rolls.map(({ number }) => number),
            );
        });
    });

    describe('get: numOfSuccesses', () =>
    {
        it('should calculate the correct number of successes', () =>
        {
            dicePool = new DicePool({
                successOnGreaterThanOrEqualTo: 4,
                extraSuccesses: 1,
            });
            dicePool.push([rolls[0], rolls[1], rolls[2]]);
            dicePool.push([rolls[3], rolls[4]]);

            // Successes: [4, 6, 2, 5, 1] -> 3 successful rolls + 1 extra success
            expect(dicePool.numOfSuccesses).toEqual(4);
        });

        it('should not add extra successes if there are no successful rolls', () =>
        {
            dicePool = new DicePool({
                successOnGreaterThanOrEqualTo: 7,
                extraSuccesses: 1,
            });
            dicePool.push([rolls[0], rolls[1]]);

            expect(dicePool.numOfSuccesses).toEqual(0);
        });
    });

    describe('method: push', () =>
    {
        it('should add a new roll to the pool', () =>
        {
            const customRolls: Roll[] = [rolls[0]];

            dicePool.push(customRolls);
            expect(dicePool.rolls).toContain(customRolls);
        });
    });

    describe('method: forEach', () =>
    {
        it('should iterate over each roll in the pool', () =>
        {
            const results: Roll[] = [];
            const expectedResults = [rolls[0], rolls[1]];

            dicePool.push(expectedResults);
            dicePool.forEach(roll => results.push(...roll));

            expect(results).toEqual(expectedResults);
        });
    });

    describe('method: map', () =>
    {
        it('should map over each roll in the pool and return transformed results', () =>
        {
            const input = [rolls[0], rolls[1]];
            dicePool.push(input);

            const results = dicePool.map(roll => roll.map(({ number }) => number * 2));
            const expectedResults = input.map(roll => roll.number * 2);
            expect(results).toEqual([expectedResults]);
        });
    });

    describe('reduce', () =>
    {
        it('should reduce the rolls in the pool and return the correct accumulated value', () =>
        {
            const input = [rolls[0], rolls[1]];
            dicePool.push(input);

            const sum = dicePool.reduce<number>((acc, innerRolls) =>
            {
                innerRolls.forEach(({ number }) => acc + number);
                return acc;
            }, 0);
            const expectedSum = input.reduce<number>((acc, roll) => acc + roll.number, 0);
            expect(sum).toBe(expectedSum);
        });
    });
});
