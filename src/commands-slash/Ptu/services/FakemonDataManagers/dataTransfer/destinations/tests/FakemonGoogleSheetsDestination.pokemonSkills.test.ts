import { FakemonGoogleSheetsDestination } from '../FakemonGoogleSheetsDestination.js';
import { FakemonGoogleSheetsData } from '../../adapters/types.js';

// This mock is necessary to prevent an ESM export error with @swc/jest
jest.mock('@beanc16/microservices-abstraction', () =>
{
    return {
        GoogleSheetsMicroservice: jest.fn(),
        GoogleSheetsMicroserviceFilterType: {
            CaseInsensitiveExcludes: 'case_insensitive_excludes',
        },
        UserMicroservice: {
            v1: {
                getServiceToServiceAuthToken: jest.fn().mockImplementation(() =>
                {
                    return {
                        data: {
                            token: 'token',
                        },
                    };
                }),
            },
        },
    };
});

const createValidPokemonSkills = (): FakemonGoogleSheetsData['pokemonSkills'] =>
{
    return Array(17).fill(['1', '+1']).reduce((acc, cur) =>
    {
        acc.push(...cur);
        return acc;
    }, []);
};

describe(`class: ${FakemonGoogleSheetsDestination.name} - pokemonSkills`, () =>
{
    let destination: FakemonGoogleSheetsDestination;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        destination = new FakemonGoogleSheetsDestination();
    });

    describe(`method: ${FakemonGoogleSheetsDestination.prototype['validatePokemonSkills'].name}`, () =>
    {
        it('should not throw an error if all skills are valid', () =>
        {
            // Arrange
            const pokemonSkills = createValidPokemonSkills();

            // Act & Assert
            expect(() => destination['validatePokemonSkills'](pokemonSkills)).not.toThrow();
        });

        describe('skill dice validation', () =>
        {
            it.each([
                [0, '1'],
                [2, '1'],
                [4, '1'],
                [6, '1'],
                [8, '1'],
                [10, '1'],
                [12, '1'],
                [14, '1'],
                [16, '1'],
                [18, '1'],
                [20, '1'],
                [22, '1'],
                [24, '1'],
                [26, '1'],
                [28, '1'],
                [30, '1'],
                [32, '1'],
            ])('should not throw an error if skill dice at index %s is "%s"', (index, value) =>
            {
                // Arrange
                const pokemonSkills = createValidPokemonSkills();
                pokemonSkills[index] = value;

                // Act & Assert
                expect(() => destination['validatePokemonSkills'](pokemonSkills)).not.toThrow();
            });

            it.each([
                [ true, '1' ],
                [ true, '2' ],
                [ true, '3' ],
                [ true, '4' ],
                [ true, '5' ],
                [ true, '6' ],
                [ false, '0' ],
                [ false, '7' ],
                [ false, '10' ],
                [ false, 'abc' ],
                [ false, '' ],
                [ false, '-1' ],
            ])('should throw an error? "%s" - if skill dice is "%s"', (shouldPass, skillDice) =>
            {
                // Arrange
                const pokemonSkills = createValidPokemonSkills();
                pokemonSkills[0] = skillDice;

                // Act & Assert
                if (shouldPass)
                {
                    expect(() => destination['validatePokemonSkills'](pokemonSkills)).not.toThrow();
                }
                else
                {
                    expect(() => destination['validatePokemonSkills'](pokemonSkills)).toThrow(`Invalid skill dice: ${skillDice}`);
                }
            });
        });

        describe('skill modifier validation', () =>
        {
            it.each([
                [1, '+1'],
                [3, '+1'],
                [5, '+1'],
                [7, '+1'],
                [9, '+1'],
                [11, '+1'],
                [13, '+1'],
                [15, '+1'],
                [17, '+1'],
                [19, '+1'],
                [21, '+1'],
                [23, '+1'],
                [25, '+1'],
                [27, '+1'],
                [29, '+1'],
                [31, '+1'],
                [33, '+1'],
            ])('should not throw an error if skill modifier at index %s is "%s"', (index, value) =>
            {
                // Arrange
                const pokemonSkills = createValidPokemonSkills();
                pokemonSkills[index] = value;

                // Act & Assert
                expect(() => destination['validatePokemonSkills'](pokemonSkills)).not.toThrow();
            });

            it.each([
                [ true, '+0' ],
                [ true, '+1' ],
                [ true, '+2' ],
                [ true, '+3' ],
                [ true, '+4' ],
                [ true, '+5' ],
                [ true, '+6' ],
                [ true, '-0' ],
                [ true, '-1' ],
                [ true, '-2' ],
                [ true, '-3' ],
                [ true, '-4' ],
                [ true, '-5' ],
                [ true, '-6' ],
                [ false, '0' ],
                [ false, '1' ],
                [ false, '+7' ],
                [ false, '-7' ],
                [ false, '+10' ],
                [ false, '-10' ],
                [ false, 'abc' ],
                [ false, '' ],
                [ false, '++1' ],
                [ false, '--1' ],
            ])('should throw an error? "%s" - if skill modifier is "%s"', (shouldPass, skillModifier) =>
            {
                // Arrange
                const pokemonSkills = createValidPokemonSkills();
                pokemonSkills[1] = skillModifier;

                // Act & Assert
                if (shouldPass)
                {
                    expect(() => destination['validatePokemonSkills'](pokemonSkills)).not.toThrow();
                }
                else
                {
                    expect(() => destination['validatePokemonSkills'](pokemonSkills)).toThrow(`Invalid skill modifier: ${skillModifier}`);
                }
            });
        });
    });

    describe(`method: ${FakemonGoogleSheetsDestination.prototype['isValidSkillDice'].name}`, () =>
    {
        it.each([
            [ true, '1' ],
            [ true, '2' ],
            [ true, '3' ],
            [ true, '4' ],
            [ true, '5' ],
            [ true, '6' ],
            [ false, '0' ],
            [ false, '7' ],
            [ false, '10' ],
            [ false, 'abc' ],
            [ false, '' ],
            [ false, '-1' ],
            [ false, '1.5' ],
        ])('should return %s for skill dice "%s"', (expected, skillDice) =>
        {
            // Act
            const result = destination['isValidSkillDice'](skillDice);

            // Assert
            expect(result).toBe(expected);
        });
    });

    describe(`method: ${FakemonGoogleSheetsDestination.prototype['isValidSkillModifier'].name}`, () =>
    {
        it.each([
            [ true, '+0' ],
            [ true, '+1' ],
            [ true, '+2' ],
            [ true, '+3' ],
            [ true, '+4' ],
            [ true, '+5' ],
            [ true, '+6' ],
            [ true, '-0' ],
            [ true, '-1' ],
            [ true, '-2' ],
            [ true, '-3' ],
            [ true, '-4' ],
            [ true, '-5' ],
            [ true, '-6' ],
            [ false, '0' ],
            [ false, '1' ],
            [ false, '+7' ],
            [ false, '-7' ],
            [ false, '+10' ],
            [ false, '-10' ],
            [ false, 'abc' ],
            [ false, '' ],
            [ false, '++1' ],
            [ false, '--1' ],
            [ false, '+1.5' ],
            [ false, '-1.5' ],
        ])('should return %s for skill modifier %s', (expected, skillModifier) =>
        {
            // Act
            const result = destination['isValidSkillModifier'](skillModifier);

            // Assert
            expect(result).toBe(expected);
        });
    });
});
