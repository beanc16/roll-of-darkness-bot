import { getFakeArray } from '../../fakes/arrays.js';
import { joinWithOxfordComma } from './stringHelpers.js';

describe('function: joinWithOxfordComma', () =>
{
    const value = 'value';

    it('should return an empty string for an empty array', () =>
    {
        const input = getFakeArray(value, 0);
        const result = joinWithOxfordComma(input);
        expect(result).toEqual('');
    });

    it('should return a single string for an array with one element', () =>
    {
        const input = getFakeArray(value, 1);
        const result = joinWithOxfordComma(input);
        expect(result).toEqual('value');
    });

    it('should join an array with two elements with an "and"', () =>
    {
        const input = getFakeArray(value, 2);
        const result = joinWithOxfordComma(input);
        expect(result).toEqual('value and value');
    });

    it('should join an array with three elements with an Oxford comma', () =>
    {
        const input = getFakeArray(value, 3);
        const result = joinWithOxfordComma(input);
        expect(result).toEqual('value, value, and value');
    });

    it('should join an array with four elements with an Oxford comma', () =>
    {
        const input = getFakeArray(value, 4);
        const result = joinWithOxfordComma(input);
        expect(result).toEqual('value, value, value, and value');
    });

    it('should handle strings with commas correctly', () =>
    {
        const input = ['apple', 'orange, juicy', 'banana'];
        const result = joinWithOxfordComma(input);
        expect(result).toEqual('apple, orange, juicy, and banana');
    });

    it('should handle strings with leading or trailing spaces', () =>
    {
        const input = [' apple ', ' orange ', ' banana '];
        const result = joinWithOxfordComma(input);
        expect(result).toEqual(' apple ,  orange , and  banana ');
    });
});
