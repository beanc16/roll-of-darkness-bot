/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { logger } from '@beanc16/logger';

import { CachedGoogleSheetsApiService } from '../../../../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { GoogleSheetsApiErrorType } from '../../../../../../../services/CachedGoogleSheetsApiService/types.js';
import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import {
    PokemonEggGroup,
    PokemonType,
    PtuHeight,
} from '../../../../../types/pokemon.js';
import { FakemonGeneralInformationManagerService } from '../../../FakemonGeneralInformationManagerService.js';
import { FakemonGoogleSheetsData } from '../../adapters/types.js';
import { FakemonGoogleSheetsDestination } from '../FakemonGoogleSheetsDestination.js';

jest.mock('../../../../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService', () =>
{
    const actual = jest.requireActual('../../../FakemonGeneralInformationManagerService');
    return {
        GoogleSheetsApiErrorType: actual.GoogleSheetsApiErrorType,
        CachedGoogleSheetsApiService: {
            append: jest.fn(),
            getRange: jest.fn(),
        },
    };
});

jest.mock('../../../FakemonGeneralInformationManagerService', () =>
{
    return {
        FakemonGeneralInformationManagerService: {
            updateTransferredTo: jest.fn(),
        },
    };
});

jest.mock('@beanc16/logger', () =>
{
    return {
        logger: {
            error: jest.fn(),
            warn: jest.fn(),
        },
    };
});

const createValidPokemonData = (): FakemonGoogleSheetsData['pokemonData'] =>
{
    return [
        'Pikachu',
        '35',
        '55',
        '40',
        '50',
        '50',
        '90',
        '',
        '',
        '5',
        '0',
        '3',
        '0',
        '0',
        '2',
        '1',
        '4',
        '-',
        'Static',
        'Lightning Rod',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        PtuHeight.Small,
        '1',
        PokemonEggGroup.Field,
        PokemonEggGroup.Fairy,
        PokemonType.Electric,
        'None',
    ];
};

const createValidPokemonSkills = (): FakemonGoogleSheetsData['pokemonSkills'] =>
{
    return Array(17).fill(['1', '+1']).reduce((acc, cur) =>
    {
        acc.push(...cur);
        return acc;
    }, []);
};

describe(`class: ${FakemonGoogleSheetsDestination.name} - pokemonData`, () =>
{
    let destination: FakemonGoogleSheetsDestination;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        destination = new FakemonGoogleSheetsDestination();
    });

    describe(`method: ${FakemonGoogleSheetsDestination.prototype.create.name}`, () =>
    {
        it('should append pokemon data and skills successfully', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const appendSpy = jest.spyOn(CachedGoogleSheetsApiService, 'append')
                .mockResolvedValue({ errorType: undefined });
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(appendSpy).toHaveBeenCalledTimes(2);
            expect(appendSpy).toHaveBeenNthCalledWith(1, {
                spreadsheetId: expect.any(String),
                range: 'Pokemon Data',
                values: [input.pokemonData],
                shouldNotCache: true,
            });
            expect(appendSpy).toHaveBeenNthCalledWith(2, {
                spreadsheetId: expect.any(String),
                range: 'Pokemon Skills',
                values: [input.pokemonSkills],
                shouldNotCache: true,
            });
            expect(updateTransferredToSpy).toHaveBeenCalledTimes(2);
            expect(updateTransferredToSpy).toHaveBeenNthCalledWith(1, {
                fakemon: source,
                transferredTo: {
                    googleSheets: {
                        pokemonData: true,
                    },
                },
            });
            expect(updateTransferredToSpy).toHaveBeenNthCalledWith(2, {
                fakemon: source,
                transferredTo: {
                    googleSheets: {
                        pokemonSkills: true,
                    },
                },
            });
        });

        it('should not update transfer status if pokemon data append fails with errorType', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const appendSpy = jest.spyOn(CachedGoogleSheetsApiService, 'append')
                .mockResolvedValue({ errorType: GoogleSheetsApiErrorType.UnknownError });
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');

            // Act
            await destination.create(input, source);

            // Assert
            expect(appendSpy).toHaveBeenCalledTimes(2);
            expect(updateTransferredToSpy).not.toHaveBeenCalled();
        });

        it('should log error and append pokemon skills if pokemon data append throws', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const error = new Error('Append failed');
            const appendSpy = jest.spyOn(CachedGoogleSheetsApiService, 'append')
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce({ errorType: undefined });
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');
            const loggerErrorSpy = jest.spyOn(logger, 'error');

            // Act
            await destination.create(input, source);

            // Assert
            expect(appendSpy).toHaveBeenCalledTimes(2);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to transfer pokemon data to Google Sheets', error);
            expect(updateTransferredToSpy).toHaveBeenCalledTimes(1);
            expect(updateTransferredToSpy).toHaveBeenCalledWith({
                fakemon: source,
                transferredTo: {
                    googleSheets: {
                        pokemonSkills: true,
                    },
                },
            });
        });

        it('should log error and append pokemon data if pokemon skills append throws', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            const error = new Error('Append failed');
            const appendSpy = jest.spyOn(CachedGoogleSheetsApiService, 'append')
                .mockResolvedValueOnce({ errorType: undefined })
                .mockRejectedValueOnce(error);
            const updateTransferredToSpy = jest.spyOn(FakemonGeneralInformationManagerService, 'updateTransferredTo');
            const loggerErrorSpy = jest.spyOn(logger, 'error');

            // Act
            await destination.create(input, source);

            // Assert
            expect(appendSpy).toHaveBeenCalledTimes(2);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Failed to transfer pokemon skills to Google Sheets', error);
            expect(updateTransferredToSpy).toHaveBeenCalledTimes(1);
            expect(updateTransferredToSpy).toHaveBeenCalledWith({
                fakemon: source,
                transferredTo: {
                    googleSheets: {
                        pokemonData: true,
                    },
                },
            });
        });
    });

    describe(`method: ${FakemonGoogleSheetsDestination.prototype['validateInput'].name}`, () =>
    {
        it('should not throw an error if input is valid', () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: createValidPokemonSkills(),
            };

            // Act & Assert
            expect(() => destination['validateInput'](input)).not.toThrow();
        });
    });

    describe(`method: ${FakemonGoogleSheetsDestination.prototype['validatePokemonData'].name}`, () =>
    {
        describe('name validation', () =>
        {
            it('should throw an error if pokemon name is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[0] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Pokemon name cannot be empty');
            });

            it('should not throw an error if pokemon name is valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[0] = 'Pikachu';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('HP validation', () =>
        {
            it('should throw an error if HP is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[1] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('HP cannot be empty');
            });

            it('should throw an error if HP is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[1] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('HP is not a number: abc');
            });

            it('should throw an error if HP is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[1] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('HP cannot be negative: -1');
            });

            it('should not throw an error if HP is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[1] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if HP is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[1] = '100';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Attack validation', () =>
        {
            it('should throw an error if Attack is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[2] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Attack cannot be empty');
            });

            it('should throw an error if Attack is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[2] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Attack is not a number: abc');
            });

            it('should throw an error if Attack is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[2] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Attack cannot be negative: -1');
            });

            it('should not throw an error if Attack is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[2] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Attack is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[2] = '100';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Defense validation', () =>
        {
            it('should throw an error if Defense is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[3] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Defense cannot be empty');
            });

            it('should throw an error if Defense is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[3] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Defense is not a number: abc');
            });

            it('should throw an error if Defense is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[3] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Defense cannot be negative: -1');
            });

            it('should not throw an error if Defense is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[3] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Defense is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[3] = '100';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Special Attack validation', () =>
        {
            it('should throw an error if Special attack is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[4] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Special attack cannot be empty');
            });

            it('should throw an error if Special attack is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[4] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Special attack is not a number: abc');
            });

            it('should throw an error if Special attack is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[4] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Special attack cannot be negative: -1');
            });

            it('should not throw an error if Special attack is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[4] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Special attack is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[4] = '100';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Special Defense validation', () =>
        {
            it('should throw an error if Special defense is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[5] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Special defense cannot be empty');
            });

            it('should throw an error if Special defense is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[5] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Special defense is not a number: abc');
            });

            it('should throw an error if Special defense is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[5] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Special defense cannot be negative: -1');
            });

            it('should not throw an error if Special defense is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[5] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Special defense is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[5] = '100';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Speed validation', () =>
        {
            it('should throw an error if Speed is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[6] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Speed cannot be empty');
            });

            it('should throw an error if Speed is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[6] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Speed is not a number: abc');
            });

            it('should throw an error if Speed is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[6] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Speed cannot be negative: -1');
            });

            it('should not throw an error if Speed is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[6] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Speed is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[6] = '100';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Overland validation', () =>
        {
            it('should throw an error if Overland is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[9] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Overland cannot be empty');
            });

            it('should throw an error if Overland is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[9] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Overland is not a number: abc');
            });

            it('should throw an error if Overland is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[9] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Overland cannot be negative: -1');
            });

            it('should not throw an error if Overland is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[9] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Overland is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[9] = '10';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Sky validation', () =>
        {
            it('should throw an error if Sky is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[10] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Sky is not a number: abc');
            });

            it('should throw an error if Sky is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[10] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Sky cannot be negative: -1');
            });

            it('should throw an error if Sky is empty string', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[10] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Sky is not a number: ');
            });

            it('should not throw an error if Sky is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[10] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Sky is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[10] = '10';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Swim validation', () =>
        {
            it('should throw an error if Swim is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[11] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Swim is not a number: abc');
            });

            it('should throw an error if Swim is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[11] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Swim cannot be negative: -1');
            });

            it('should throw an error if Swim is empty string', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[11] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Swim is not a number: ');
            });

            it('should not throw an error if Swim is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[11] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Swim is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[11] = '10';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Levitate validation', () =>
        {
            it('should throw an error if Levitate is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[12] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Levitate is not a number: abc');
            });

            it('should throw an error if Levitate is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[12] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Levitate cannot be negative: -1');
            });

            it('should not throw an error if Levitate is empty string', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[12] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Levitate is not a number: ');
            });

            it('should not throw an error if Levitate is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[12] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Levitate is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[12] = '10';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Burrow validation', () =>
        {
            it('should throw an error if Burrow is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[13] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Burrow is not a number: abc');
            });

            it('should throw an error if Burrow is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[13] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Burrow cannot be negative: -1');
            });

            it('should not throw an error if Burrow is empty string', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[13] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Burrow is not a number: ');
            });

            it('should not throw an error if Burrow is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[13] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Burrow is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[13] = '10';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('High Jump validation', () =>
        {
            it('should throw an error if High jump is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[14] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('High jump is not a number: abc');
            });

            it('should throw an error if High jump is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[14] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('High jump cannot be negative: -1');
            });

            it('should not throw an error if High jump is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[14] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if High jump is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[14] = '5';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Low Jump validation', () =>
        {
            it('should throw an error if Low jump is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[15] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Low jump is not a number: abc');
            });

            it('should throw an error if Low jump is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[15] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Low jump cannot be negative: -1');
            });

            it('should not throw an error if Low jump is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[15] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Low jump is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[15] = '3';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Power validation', () =>
        {
            it('should throw an error if Power is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[16] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Power is not a number: abc');
            });

            it('should throw an error if Power is negative', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[16] = '-1';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Power cannot be negative: -1');
            });

            it('should not throw an error if Power is zero', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[16] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Power is a positive number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[16] = '8';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Naturewalk validation', () =>
        {
            it('should throw an error if Naturewalk is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[17] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Naturewalk cannot be empty');
            });

            it('should not throw an error if Naturewalk is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[17] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Naturewalk has a value', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[17] = 'Forest, Cave';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 1 validation', () =>
        {
            it('should throw an error if Capability 1 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[18] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 1 cannot be empty');
            });

            it('should not throw an error if Capability 1 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[18] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Capability 1 has a value', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[18] = 'Lightning Rod';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 2 validation', () =>
        {
            it('should throw an error if Capability 2 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[19] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 2 cannot be empty');
            });

            it('should not throw an error if Capability 2 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[19] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Capability 2 has a value', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[19] = 'Volt Absorb';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 3 validation', () =>
        {
            it('should throw an error if Capability 3 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[20] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 3 cannot be empty');
            });

            it('should not throw an error if Capability 3 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[20] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 4 validation', () =>
        {
            it('should throw an error if Capability 4 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[21] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 4 cannot be empty');
            });

            it('should not throw an error if Capability 4 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[21] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 5 validation', () =>
        {
            it('should throw an error if Capability 5 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[22] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 5 cannot be empty');
            });

            it('should not throw an error if Capability 5 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[22] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 6 validation', () =>
        {
            it('should throw an error if Capability 6 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[23] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 6 cannot be empty');
            });

            it('should not throw an error if Capability 6 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[23] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 7 validation', () =>
        {
            it('should throw an error if Capability 7 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[24] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 7 cannot be empty');
            });

            it('should not throw an error if Capability 7 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[24] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 8 validation', () =>
        {
            it('should throw an error if Capability 8 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[25] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 8 cannot be empty');
            });

            it('should not throw an error if Capability 8 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[25] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Capability 9 validation', () =>
        {
            it('should throw an error if Capability 9 is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[26] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Capability 9 cannot be empty');
            });

            it('should not throw an error if Capability 9 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[26] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Size validation', () =>
        {
            it('should throw an error if Size is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[27] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Size cannot be empty');
            });

            it('should throw an error if Size is not valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[27] = 'InvalidSize';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Size is not valid: InvalidSize');
            });

            it('should not throw an error if Size is valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[27] = PtuHeight.Small;

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Weight validation', () =>
        {
            it('should throw an error if Weight is empty', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[28] = '';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Weight cannot be empty');
            });

            it('should throw an error if Weight is not a number', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[28] = 'abc';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Weight is not valid: abc');
            });

            it('should throw an error if Weight is 0', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[28] = '0';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Weight is not valid: 0');
            });

            it('should throw an error if Weight is 8', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[28] = '8';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Weight is not valid: 8');
            });

            it.each([1, 2, 3, 4, 5, 6, 7])('should not throw an error if Weight is %s', (weight) =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[28] = weight.toString();

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Egg Group 1 validation', () =>
        {
            it('should throw an error if Egg group 1 is not valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[29] = 'InvalidEggGroup';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Egg group 1 is not valid: InvalidEggGroup');
            });

            it('should not throw an error if Egg group 1 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[29] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Egg group 1 is valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[29] = PokemonEggGroup.Field;

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Egg Group 2 validation', () =>
        {
            it('should throw an error if Egg group 2 is not valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[30] = 'InvalidEggGroup';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Egg group 2 is not valid: InvalidEggGroup');
            });

            it('should not throw an error if Egg group 2 is a hyphen', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[30] = '-';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Egg group 2 is valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[30] = PokemonEggGroup.Fairy;

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Type 1 validation', () =>
        {
            it('should throw an error if Type 1 is not valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[31] = 'InvalidType';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Type 1 is not valid: InvalidType');
            });

            it('should not throw an error if Type 1 is "None"', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[31] = 'None';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Type 1 is valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[31] = PokemonType.Electric;

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });

        describe('Type 2 validation', () =>
        {
            it('should throw an error if Type 2 is not valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[32] = 'InvalidType';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).toThrow('Type 2 is not valid: InvalidType');
            });

            it('should not throw an error if Type 2 is "None"', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[32] = 'None';

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });

            it('should not throw an error if Type 2 is valid', () =>
            {
                // Arrange
                const pokemonData = createValidPokemonData();
                pokemonData[32] = PokemonType.Flying;

                // Act & Assert
                expect(() => destination['validatePokemonData'](pokemonData)).not.toThrow();
            });
        });
    });

    describe(`method: ${FakemonGoogleSheetsDestination.prototype.wasTransferred.name}`, () =>
    {
        it('should return true if pokemon data contains the name and source was transferred', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('+1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.googleSheets.pokemonData = true;
            source.transferredTo.googleSheets.pokemonSkills = true;
            const getRangeSpy = jest.spyOn(CachedGoogleSheetsApiService, 'getRange')
                .mockResolvedValue({
                    data: [
                        ['Charizard'],
                        ['Blastoise'],
                        ['Pikachu'],
                    ],
                    errorType: undefined,
                });

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getRangeSpy).toHaveBeenCalledTimes(1);
            expect(getRangeSpy).toHaveBeenCalledWith({
                spreadsheetId: expect.any(String),
                range: 'Pokemon Data',
                shouldNotCache: true,
            });
            expect(result).toBe(true);
        });

        it('should return false if pokemon data does not contain the name', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('+1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.googleSheets.pokemonData = true;
            source.transferredTo.googleSheets.pokemonSkills = true;
            const getRangeSpy = jest.spyOn(CachedGoogleSheetsApiService, 'getRange')
                .mockResolvedValue({
                    data: [
                        ['Charizard'],
                        ['Blastoise'],
                    ],
                    errorType: undefined,
                });

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getRangeSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if source was not transferred to pokemon data', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('+1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.googleSheets.pokemonData = false;
            source.transferredTo.googleSheets.pokemonSkills = true;
            const getRangeSpy = jest.spyOn(CachedGoogleSheetsApiService, 'getRange')
                .mockResolvedValue({
                    data: [
                        ['Pikachu'],
                    ],
                    errorType: undefined,
                });

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getRangeSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if source was not transferred to pokemon skills', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('+1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.googleSheets.pokemonData = true;
            source.transferredTo.googleSheets.pokemonSkills = false;
            const getRangeSpy = jest.spyOn(CachedGoogleSheetsApiService, 'getRange')
                .mockResolvedValue({
                    data: [
                        ['Pikachu'],
                    ],
                    errorType: undefined,
                });

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getRangeSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false and log warning if getRange returns error', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('+1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.googleSheets.pokemonData = true;
            source.transferredTo.googleSheets.pokemonSkills = true;
            const getRangeSpy = jest.spyOn(CachedGoogleSheetsApiService, 'getRange')
                .mockResolvedValue({
                    data: [],
                    errorType: GoogleSheetsApiErrorType.UnableToParseRange,
                });
            const loggerWarnSpy = jest.spyOn(logger, 'warn');

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getRangeSpy).toHaveBeenCalledTimes(1);
            expect(loggerWarnSpy).toHaveBeenCalledWith('Failed to get pokemon data from Google Sheets', GoogleSheetsApiErrorType.UnableToParseRange);
            expect(result).toBe(false);
        });

        it('should return false if data is empty array', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('+1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.googleSheets.pokemonData = true;
            source.transferredTo.googleSheets.pokemonSkills = true;
            const getRangeSpy = jest.spyOn(CachedGoogleSheetsApiService, 'getRange')
                .mockResolvedValue({
                    data: [],
                    errorType: undefined,
                });

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getRangeSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });

        it('should return false if data is undefined', async () =>
        {
            // Arrange
            const input: FakemonGoogleSheetsData = {
                pokemonData: createValidPokemonData(),
                pokemonSkills: Array(34).fill('+1'),
            };
            const source = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });
            source.transferredTo.googleSheets.pokemonData = true;
            source.transferredTo.googleSheets.pokemonSkills = true;
            const getRangeSpy = jest.spyOn(CachedGoogleSheetsApiService, 'getRange')
                .mockResolvedValue({
                    data: undefined,
                    errorType: undefined,
                });

            // Act
            const result = await destination.wasTransferred(input, source);

            // Assert
            expect(getRangeSpy).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });
    });
});
