import { RandomService } from '../../src/services/RandomService.js';

/**
 * These tests are for the RandomService class, which
 * generates random values. Due to the random nature
 * of the values, these tests are not deterministic,
 * so we attempt to test the methods by generating
 * multiple random values and ensuring that they
 * are all within the expected range to get
 * "close enough" confidence that the method works.
 */

type DescribeEachType = [
    ('getRandomDecimal' | 'getRandomInteger'),
    string,
    number,
][];

describe('class: RandomService', () =>
{
    const numOfIterations = 100;

    describe.each([
        ['getRandomDecimal', 'decimal', 0],
        ['getRandomInteger', 'integer', 1],
    ] as DescribeEachType)('method: %s', (methodName, randomValueType, min) =>
    {
        it(`should return a random ${randomValueType} between ${min} and max`, () =>
        {
            const max = 10;
            const results = Array.from({ length: numOfIterations }, () =>
                RandomService[methodName](max),
            );

            results.forEach((result) =>
            {
                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThanOrEqual(max);
            });
        });
    });

    describe('method: getUniqueRandomIntegers', () =>
    {
        it.each([
            ['with max of 0 and count of 0', {
                max: 0,
                count: 0,
            }],
            ['with max of 1000 and count of 100', {
                max: 1000,
                count: 100,
            }],
            ['with max of 100 and count of 1000', {
                max: 100,
                count: 100,
            }],
        ])('should return an array of unique integers %s', (_, { max, count }) =>
        {
            const results = RandomService.getUniqueRandomIntegers(max, count);

            // Returns the correct number of results
            expect(results.length).toEqual(count);

            // The results are unique
            expect(new Set(results).size).toEqual(count);

            // The results are in the given range
            results.forEach((result) =>
            {
                expect(result).toBeGreaterThanOrEqual(1);
                expect(result).toBeLessThanOrEqual(max);
            });
        });

        it('should throw an error if count is greater than max', () =>
        {
            const max = 10;
            const count = 11;
            expect(() => RandomService.getUniqueRandomIntegers(max, count)).toThrow();
        });
    });
});
