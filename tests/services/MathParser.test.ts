import { AddAndSubtractMathParser } from '../../src/services/MathParser/AddAndSubtractMathParser.js';
import { AddMathParser } from '../../src/services/MathParser/AddMathParser.js';
import { MathParser } from '../../src/services/MathParser/MathParser.js';

describe.each([
    [AddMathParser.name, AddMathParser],
    [AddAndSubtractMathParser.name, AddAndSubtractMathParser],
])('class: %s', (_, Class) =>
{
    let parser: MathParser;

    beforeEach(() =>
    {
        parser = new Class();
    });

    describe('method: evaluate', () =>
    {
        it('returns correct result for valid addition expression', () =>
        {
            expect(parser.evaluate('2 + 3')).toEqual(5);
            expect(parser.evaluate('10+20')).toEqual(30);
        });

        test('returns correct result for valid addition expressions with variables', () =>
        {
            expect(
                parser.evaluate('x + 5', { x: 2 }),
            ).toEqual(7);
        });

        it('returns undefined for invalid expressions', () =>
        {
            const results = [
                parser.evaluate('2 +'),
                parser.evaluate('hello + 3'),
                parser.evaluate('2 * 3/4 % 5'),
            ];

            results.forEach((result) =>
            {
                expect(result).toBeUndefined();
            });
        });

        test('returns undefined for expression with missing variables', () =>
        {
            expect(parser.evaluate('x + 5')).toBeUndefined();
        });
    });
});

describe(`class: ${AddAndSubtractMathParser.name}`, () =>
{
    let parser: AddAndSubtractMathParser;

    beforeEach(() =>
    {
        parser = new AddAndSubtractMathParser();
    });

    describe('method: evaluate', () =>
    {
        it('returns correct result for valid subtraction expression', () =>
        {
            expect(
                parser.evaluate('10 - 4'),
            ).toEqual(6);

            expect(
                parser.evaluate('30-10'),
            ).toEqual(20);
        });

        test('returns correct result for valid subtraction expressions with variables', () =>
        {
            expect(
                parser.evaluate('y - 2', { y: 10 }),
            ).toEqual(8);
        });
    });
});
