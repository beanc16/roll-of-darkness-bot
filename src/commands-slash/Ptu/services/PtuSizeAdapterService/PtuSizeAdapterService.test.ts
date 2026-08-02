/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuHeight, type PtuPokemon } from '../../types/pokemon';
import { PtuSizeAdapterService } from './PtuSizeAdapterService';

describe(`class ${PtuSizeAdapterService.name}`, () =>
{
    /**
     * [feet, inches, PtuHeight, expectedInches, expectedMeters]
     */
    const heightToPtuSizeTuple = [
        // 0-11 inches
        [0, 1, PtuHeight.Small, 1, 0.025],
        [0, 6, PtuHeight.Small, 6, 0.152],
        [0, 11, PtuHeight.Small, 11, 0.279],
        // 12-23 inches
        [1, 0, PtuHeight.Small, 12, 0.305],
        [1, 6, PtuHeight.Small, 18, 0.457],
        [1, 11, PtuHeight.Small, 23, 0.584],
        // 24-35 inches
        [2, 0, PtuHeight.Small, 24, 0.610],
        [2, 6, PtuHeight.Small, 30, 0.762],
        [2, 11, PtuHeight.Small, 35, 0.889],
        // 36-47 inches
        [3, 0, PtuHeight.Small, 36, 0.914],
        [3, 2, PtuHeight.Small, 38, 0.965],
        [3, 3, PtuHeight.Medium, 39, 0.991],
        [3, 6, PtuHeight.Medium, 42, 1.067],
        [3, 11, PtuHeight.Medium, 47, 1.194],
        // 48-59 inches
        [4, 0, PtuHeight.Medium, 48, 1.219],
        [4, 6, PtuHeight.Medium, 54, 1.372],
        [4, 11, PtuHeight.Medium, 59, 1.499],
        // 60-71 inches
        [5, 0, PtuHeight.Medium, 60, 1.524],
        [5, 6, PtuHeight.Medium, 66, 1.676],
        [5, 11, PtuHeight.Medium, 71, 1.803],
        // 72-83 inches
        [6, 0, PtuHeight.Large, 72, 1.829],
        [6, 6, PtuHeight.Large, 78, 1.981],
        [6, 11, PtuHeight.Large, 83, 2.108],
        // 84-95 inches
        [7, 0, PtuHeight.Large, 84, 2.134],
        [7, 6, PtuHeight.Large, 90, 2.286],
        [7, 11, PtuHeight.Large, 95, 2.413],
        // 96-107 inches
        [8, 0, PtuHeight.Large, 96, 2.438],
        [8, 6, PtuHeight.Large, 102, 2.591],
        [8, 11, PtuHeight.Large, 107, 2.718],
        // 108-119 inches
        [9, 0, PtuHeight.Huge, 108, 2.743],
        [9, 6, PtuHeight.Huge, 114, 2.896],
        [9, 11, PtuHeight.Huge, 119, 3.023],
        // 120-131 inches
        [10, 0, PtuHeight.Huge, 120, 3.048],
        [10, 6, PtuHeight.Huge, 126, 3.200],
        [10, 11, PtuHeight.Huge, 131, 3.327],
        // 132-143 inches
        [11, 0, PtuHeight.Huge, 132, 3.353],
        [11, 6, PtuHeight.Huge, 138, 3.505],
        [11, 11, PtuHeight.Huge, 143, 3.632],
        // 144-155 inches
        [12, 0, PtuHeight.Huge, 144, 3.658],
        [12, 6, PtuHeight.Huge, 150, 3.810],
        [12, 11, PtuHeight.Huge, 155, 3.937],
        // 156-167 inches
        [13, 0, PtuHeight.Huge, 156, 3.962],
        [13, 6, PtuHeight.Huge, 162, 4.115],
        [13, 11, PtuHeight.Huge, 167, 4.242],
        // 168-179 inches
        [14, 0, PtuHeight.Gigantic, 168, 4.267],
        [14, 6, PtuHeight.Gigantic, 174, 4.420],
        [14, 11, PtuHeight.Gigantic, 179, 4.547],
        // 180-191 inches
        [15, 0, PtuHeight.Gigantic, 180, 4.572],
        [15, 6, PtuHeight.Gigantic, 186, 4.724],
        [15, 11, PtuHeight.Gigantic, 191, 4.851],
        // 192 inches
        [16, 0, PtuHeight.Gigantic, 192, 4.877],
    ] as const;

    /**
     * [lbs, expectedWeightClass, heavyMetalStringForTestCases, abilitiesObject]
     */
    const weightToPtuWeightClassTuple: [number, number, string, PtuPokemon['abilities'], number][] = [
        // Weight Class 1 (0–25)
        [0, 1, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 0.0],
        [10, 1, 'w/ Heavy Metal', {
            basicAbilities: ['Heavy Metal'], advancedAbilities: [], highAbility: '',
        }, 4.5],
        [15, 1, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: ['Heavy Metal'], highAbility: '',
        }, 6.8],
        [20, 1, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: 'Heavy Metal',
        }, 9.1],
        [25, 1, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 11.3],

        // Weight Class 2 (26–55)
        [26, 2, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 11.8],
        [35, 2, 'w/ Heavy Metal', {
            basicAbilities: ['Heavy Metal'], advancedAbilities: [], highAbility: '',
        }, 15.9],
        [42, 2, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: ['Heavy Metal'], highAbility: '',
        }, 19.1],
        [40, 2, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: 'Heavy Metal',
        }, 18.1],
        [55, 2, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 24.9],

        // Weight Class 3 (56–110)
        [56, 3, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 25.4],
        [65, 3, 'w/ Heavy Metal', {
            basicAbilities: ['Heavy Metal'], advancedAbilities: [], highAbility: '',
        }, 29.5],
        [82, 3, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: ['Heavy Metal'], highAbility: '',
        }, 37.2],
        [100, 3, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: 'Heavy Metal',
        }, 45.4],
        [110, 3, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 49.9],

        // Weight Class 4 (111–220)
        [111, 4, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 50.3],
        [143, 4, 'w/ Heavy Metal', {
            basicAbilities: ['Heavy Metal'], advancedAbilities: [], highAbility: '',
        }, 64.9],
        [176, 4, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: ['Heavy Metal'], highAbility: '',
        }, 79.8],
        [201, 4, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: 'Heavy Metal',
        }, 91.2],
        [220, 4, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 99.8],

        // Weight Class 5 (221–440)
        [221, 5, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 100.2],
        [317, 5, 'w/ Heavy Metal', {
            basicAbilities: ['Heavy Metal'], advancedAbilities: [], highAbility: '',
        }, 143.8],
        [384, 5, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: ['Heavy Metal'], highAbility: '',
        }, 174.2],
        [413, 5, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: 'Heavy Metal',
        }, 187.3],
        [440, 5, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 199.6],

        // Weight Class 6 (>440, no Heavy Metal)
        [441, 6, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 200.0],
        [443, 6, 'w/ Heavy Metal', {
            basicAbilities: ['Heavy Metal'], advancedAbilities: [], highAbility: '',
        }, 200.9],
        [447, 6, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: ['Heavy Metal'], highAbility: '',
        }, 202.8],
        [449, 6, 'w/ Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: 'Heavy Metal',
        }, 203.7],
        [450, 6, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 204.1],
        [451, 6, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 204.6],
        [600, 6, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 272.2],
        [800, 6, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 362.9],
        [1200, 6, 'w/o Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: '',
        }, 544.3],

        // Weight Class 7 (≥450 with Heavy Metal)
        [450, 7, 'w Heavy Metal', {
            basicAbilities: ['Heavy Metal'], advancedAbilities: [], highAbility: '',
        }, 204.1],
        [800, 7, 'w Heavy Metal', {
            basicAbilities: [], advancedAbilities: ['Heavy Metal'], highAbility: '',
        }, 362.9],
        [1200, 7, 'w Heavy Metal', {
            basicAbilities: [], advancedAbilities: [], highAbility: 'Heavy Metal',
        }, 544.3],
    ];

    describe(`method: ${PtuSizeAdapterService.adaptWeight.name}`, () =>
    {
        it.each(weightToPtuWeightClassTuple)(`should convert weight %s to PTU weight class %s %s`, (lbs, expectedWeightClass, _, expectedAbilities, kgs) =>
        {
            // Act
            const result = PtuSizeAdapterService.adaptWeight(
                lbs,
                expectedAbilities,
            );

            // Assert
            expect(result).toEqual({
                freedom: `${lbs}lbs`,
                metric: `${kgs}kg`,
                ptu: expectedWeightClass,
            });
        });

        it('should throw an error if weight is an invalid decimal', () =>
        {
            // Act & Assert
            expect(() =>
                PtuSizeAdapterService.adaptWeight(
                    'invalid' as unknown as number,
                    {
                        basicAbilities: [], advancedAbilities: [], highAbility: '',
                    },
                ),
            ).toThrow(`Invalid weight value: invalid`);
        });
    });

    describe(`method: ${PtuSizeAdapterService['formatWeight'].name}`, () =>
    {
        it.each(weightToPtuWeightClassTuple)('should convert weight %s to PTU weight class %s %s', (lbs, expectedWeightClass, _, expectedAbilities, kgs) =>
        {
            // Act
            const result = PtuSizeAdapterService['formatWeight'](lbs, kgs, expectedAbilities);

            // Assert
            expect(result).toEqual({
                freedom: `${lbs}lbs`,
                metric: `${kgs}kg`,
                ptu: expectedWeightClass,
            });
        });
    });

    describe(`method: ${PtuSizeAdapterService['getPtuWeightClass'].name}`, () =>
    {
        it.each(weightToPtuWeightClassTuple)('should convert weight %s to PTU weight class %s %s', (weight, expectedWeightClass, _, expectedAbilities) =>
        {
            // Act
            const result = PtuSizeAdapterService['getPtuWeightClass'](weight, expectedAbilities);

            // Assert
            expect(result).toBe(expectedWeightClass);
        });

        it('should throw an error if weight is negative', () =>
        {
            expect(() =>
            {
                PtuSizeAdapterService['getPtuWeightClass'](-1, {
                    basicAbilities: [],
                    advancedAbilities: [],
                    highAbility: '',
                });
            }).toThrow(`Invalid weight: -1lb`);
        });
    });

    describe(`method: ${PtuSizeAdapterService.adaptHeight.name}`, () =>
    {
        it.each(
            heightToPtuSizeTuple.map(element => [element[0], element[1], element[2], element[4]]),
        )(`should convert %s'%s" to a PTU height of '%s'`, (
            feet,
            inches,
            expectedPtuHeight,
            meters,
        ) =>
        {
            // Arrange
            const expectedMeters = parseFloat(meters.toFixed(1));

            // Act
            const result = PtuSizeAdapterService.adaptHeight(
                feet,
                inches,
            );

            // Assert
            expect(result).toEqual({
                freedom: `${feet}'${inches}"`,
                metric: `${expectedMeters}m`,
                ptu: expectedPtuHeight,
            });
        });

        it.each([
            [3, 0, `3'0"`],
            [3, 6, `3'6"`],
            [3, 11, `3'11"`],
            [3, 13, `4'1"`],
            [3, 23, `4'11"`],
            [3, 24, `5'0"`],
            [3, 25, `5'1"`],
        ])(`should convert %s'%s" to %s`, (feet, inches, expectedResult) =>
        {
            // Act
            const result = PtuSizeAdapterService.adaptHeight(
                feet,
                inches,
            );

            // Assert
            expect(result.freedom).toEqual(expectedResult);
        });

        it('should throw an error if feet is a decimal', () =>
        {
            // Arrange
            const feet = 1.5;
            const inches = 0;

            // Act & Assert
            expect(() =>
                PtuSizeAdapterService.adaptHeight(feet, inches),
            ).toThrow(new Error(`Feet and inches must be provided as integers: ${feet}ft ${inches}in`));
        });

        it('should throw an error if inches are a decimal', () =>
        {
            // Arrange
            const feet = 0;
            const inches = 1.5;

            // Act & Assert
            expect(() =>
                PtuSizeAdapterService.adaptHeight(feet, inches),
            ).toThrow(new Error(`Feet and inches must be provided as integers: ${feet}ft ${inches}in`));
        });
    });

    describe(`method: ${PtuSizeAdapterService['formatHeight'].name}`, () =>
    {
        it.each(heightToPtuSizeTuple)(`should convert %s'%s" to a PTU height of '%s'`, (
            feet,
            inches,
            expectedPtuHeight,
            totalInches,
            meters,
        ) =>
        {
            // Arrange
            const expectedMeters = parseFloat(meters.toFixed(1));

            // Act
            const result = PtuSizeAdapterService['formatHeight'](
                feet,
                inches,
                totalInches,
                expectedMeters,
            );

            // Assert
            expect(result).toEqual({
                freedom: `${feet}'${inches}"`,
                metric: `${expectedMeters}m`,
                ptu: expectedPtuHeight,
            });
        });
    });

    describe(`method: ${PtuSizeAdapterService['getPtuHeightClass'].name}`, () =>
    {
        it.each(heightToPtuSizeTuple)(`should convert %s'%s" to a PTU height of '%s'`, (feet, inches, expectedInches) =>
        {
            // Act
            const result = PtuSizeAdapterService['getPtuHeightClass'](
                feet,
                inches,
                feet * 12 + inches,
            );

            // Assert
            expect(result).toBe(expectedInches);
        });

        it('should throw an error if height is negative', () =>
        {
            expect(() =>
            {
                PtuSizeAdapterService['getPtuHeightClass'](0, -1, -1);
            }).toThrow(`Invalid height: 0'-1" (-1 inches)`);
        });
    });

    describe(`method: ${PtuSizeAdapterService['feetAndInchesToInches'].name}`, () =>
    {
        it.each(
            heightToPtuSizeTuple.map(([feet, inches, _, expectedInches]) => [feet, inches, expectedInches]),
        )(`should convert %s'%s" to %s inches`, (feet, inches, expectedInches) =>
        {
            // Act
            const result = PtuSizeAdapterService['feetAndInchesToInches'](feet, inches);

            // Assert
            expect(result).toBe(expectedInches);
        });
    });

    describe(`method: ${PtuSizeAdapterService['overflowInchesIntoFeet'].name}`, () =>
    {
        it.each([
            [3, 0, { ft: 3, inches: 0 }],
            [3, 6, { ft: 3, inches: 6 }],
            [3, 11, { ft: 3, inches: 11 }],
            [3, 13, { ft: 4, inches: 1 }],
            [3, 23, { ft: 4, inches: 11 }],
            [3, 24, { ft: 5, inches: 0 }],
            [3, 25, { ft: 5, inches: 1 }],
        ])(`should convert %s'%s" to %s`, (feet, inches, expectedResult) =>
        {
            // Act
            const result = PtuSizeAdapterService['overflowInchesIntoFeet'](feet, inches);

            // Assert
            expect(result).toEqual(expectedResult);
        });
    });

    describe(`method: ${PtuSizeAdapterService['convert'].name}`, () =>
    {
        it.each(
            Array.from({ length: 16 }, (_, i) => i + 1),
        )(`should convert %s feet to inches with 0 decimals`, (feet) =>
        {
            // Act
            const result = PtuSizeAdapterService['convert']({
                value: feet,
                from: 'feet',
                to: 'in',
            });

            // Assert
            expect(result).toBe(feet * 12);
        });

        it.each([
            [1000, 1, 0],
            [100, 0.1, 1],
            [10, 0.01, 2],
            [490, 0, 0],
            [490, 0.5, 1],
            [491, 0.49, 2],
            [491, 0.491, 3],
            [491, 0.491, 4],
        ])('should convert %smm to %sm with %s decimals', (value, expected, decimals) =>
        {
            // Act
            const result = PtuSizeAdapterService['convert']({
                value,
                from: 'mm',
                to: 'm',
                decimals,
            });

            // Assert
            expect(result).toBe(expected);
        });

        it.each([
            [100, 45, 0],
            [100, 45.4, 1],
            [100, 45.36, 2],
            [100, 45.359, 3],
            [100, 45.3592, 4],
        ])('should convert %slbs to %skgs with %s decimals', (value, expected, decimals) =>
        {
            // Act
            const result = PtuSizeAdapterService['convert']({
                value,
                from: 'lb',
                to: 'kg',
                decimals,
            });

            // Assert
            expect(result).toBe(expected);
        });

        it.each([
            [100, 3, 0],
            [100, 2.5, 1],
            [100, 2.54, 2],
            [100, 2.54, 3],
            [100, 2.54, 4],
        ])('should convert %sin to %sm with %s decimals', (value, expected, decimals) =>
        {
            // Act
            const result = PtuSizeAdapterService['convert']({
                value,
                from: 'in',
                to: 'm',
                decimals,
            });

            // Assert
            expect(result).toBe(expected);
        });

        it('should throw an error if decimals is negative', () =>
        {
            // Act & Assert
            expect(() =>
                PtuSizeAdapterService['convert']({
                    value: 1,
                    from: 'lb',
                    to: 'kg',
                    decimals: -1,
                }),
            ).toThrow('Decimals must be a positive number: -1');
        });
    });
});
