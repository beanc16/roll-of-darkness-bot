import { removeExtraCharactersFromMoveName } from '../../../../src/commands-slash/Ptu/services/pokemonMoveHelpers.js';

describe('function: removeExtraCharactersFromMoveName', () =>
{
    it('should not alter strings with no extra characters', () =>
    {
        const input = 'Shadow Ball';
        const result = removeExtraCharactersFromMoveName(input);
        expect(result).toEqual(input);
    });

    it('should return an empty string if input is empty', () =>
    {
        const result = removeExtraCharactersFromMoveName('');
        expect(result).toEqual('');
    });

    it.each([
        ['(N)', 'Tackle (N)', 'Tackle'],                    // Removes "(N)"
        ['(n)', 'Tackle (n)', 'Tackle'],                    // Removes "(N)"
        ['leading numbers', '06 Toxic', 'Toxic'],           // Removes leading numbers
        ['leading "A" and numbers', 'A2 Fly', 'Fly'],       // Removes "A" and numbers
        ['§', '§Dynamax Cannon', 'Dynamax Cannon'],         // Removes "§"
        ['trailing spaces', 'Earthquake ', 'Earthquake'],   // Trims trailing spaces
        ['leading spaces', '    Fly', 'Fly'],               // Trims leading spaces
        ['§, (N), trailing and leading spaces', ' § Psychic (N) ', 'Psychic'],  // Handles multiple cases
    ])('should remove extra "%s" characters', (_, input, expected) =>
    {
        const result = removeExtraCharactersFromMoveName(input);
        expect(result).toEqual(expected);
    });
});
