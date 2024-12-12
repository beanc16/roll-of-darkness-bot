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
});
