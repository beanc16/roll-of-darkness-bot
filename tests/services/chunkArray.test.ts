import { jest } from '@jest/globals';

import { chunkArray } from '../../src/services/chunkArray.js';

describe('function: chunkArray', () =>
{
    let array: number[];

    beforeEach(() =>
    {
        array = [1, 2, 3, 4, 5];
    });

    afterEach(() =>
    {
        jest.clearAllMocks();
    });

    it('should handle an empty array', () =>
    {
        const input: number[] = [];
        const callback = (item: number): boolean => item % 2 === 0;

        const result = chunkArray({
            array: input,
            shouldMoveToNextChunk: callback,
        });

        const expectedResult: number[] = [];
        expect(result).toEqual(expectedResult);
    });

    it('should put all elements in a single chunk if callback always returns false', () =>
    {
        const callback = (): boolean => false;

        const result = chunkArray({
            array,
            shouldMoveToNextChunk: callback,
        });

        const expectedResult = [array];
        expect(result).toEqual(expectedResult);
    });

    it('should create a new chunk for every element if callback always returns true', () =>
    {
        const callback = (): boolean => true;

        const result = chunkArray({
            array,
            shouldMoveToNextChunk: callback,
        });

        const expectedResult = array.map(element => [element]);
        expect(result).toEqual(expectedResult);
    });

    it('should chunk the array based on the callback condition', () =>
    {
        const shouldMoveToNextChunk = (item: number): boolean => item % 3 === 0;

        const result = chunkArray({
            array: [...array, 6],
            shouldMoveToNextChunk,
        });

        const expectedResult = [
            [1, 2],
            [3, 4, 5],
            [6],
        ];
        expect(result).toEqual(expectedResult);
    });
});
