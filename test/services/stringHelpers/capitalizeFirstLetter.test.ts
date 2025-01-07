import { capitalizeFirstLetter } from '../../../src/services/stringHelpers.js';

describe('function: capitalizeFirstLetter', () =>
{
    it('should capitalize the first letter of a string and leave the rest unchanged', () =>
    {
        expect(capitalizeFirstLetter('hello')).toEqual('Hello');
        expect(capitalizeFirstLetter('hello world')).toEqual('Hello world');
        expect(capitalizeFirstLetter('javaScript')).toEqual('JavaScript');
    });

    it('should leave an already-capitalized first letter capitalized', () =>
    {
        expect(capitalizeFirstLetter('Hello')).toEqual('Hello');
        expect(capitalizeFirstLetter('HTML')).toEqual('HTML');
    });

    it('should return an empty string if an empty string is given', () =>
    {
        expect(capitalizeFirstLetter('')).toEqual('');
    });

    it('should capitalize the only letter of a single-letter string', () =>
    {
        expect(capitalizeFirstLetter('a')).toEqual('A');
        expect(capitalizeFirstLetter('Z')).toEqual('Z');
    });

    it('should return the same string if it starts with a number, symbol, or space', () =>
    {
        expect(capitalizeFirstLetter('123abc')).toEqual('123abc');
        expect(capitalizeFirstLetter('!hello')).toEqual('!hello');
        expect(capitalizeFirstLetter('@hello')).toEqual('@hello');
        expect(capitalizeFirstLetter(' hello')).toEqual(' hello');
    });
});
