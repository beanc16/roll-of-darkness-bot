/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { faker } from '@faker-js/faker';

import { FakemonStatsEditStringSelectElementOptions } from '../../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { FakemonStatManagerService } from '../FakemonStatManagerService';

jest.mock('mongodb-controller');
jest.mock('../../../dal/PtuFakemonController');
jest.mock('../../../dal/PtuFakemonPseudoCache', () =>
{
    return {
        PtuFakemonPseudoCache: {
            update: jest.fn(),
        },
    };
});

describe(`class: ${FakemonStatManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${FakemonStatManagerService.getStatKey.name}`, () =>
    {
        it.each([
            ['hp', FakemonStatsEditStringSelectElementOptions.HP],
            ['attack', FakemonStatsEditStringSelectElementOptions.Attack],
            ['defense', FakemonStatsEditStringSelectElementOptions.Defense],
            ['specialAttack', FakemonStatsEditStringSelectElementOptions.SpecialAttack],
            ['specialDefense', FakemonStatsEditStringSelectElementOptions.SpecialDefense],
            ['speed', FakemonStatsEditStringSelectElementOptions.Speed],
        ])(`should return '%s' for '%s'`, (expectedStatKey, statToEdit) =>
        {
            // Act
            const result = FakemonStatManagerService.getStatKey(statToEdit);

            // Assert
            expect(result).toEqual(expectedStatKey);
        });

        it('should throw an error if statToEdit is not a valid FakemonStatsEditStringSelectElementOptions', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonStatManagerService.getStatKey('invalid' as FakemonStatsEditStringSelectElementOptions),
            ).toThrow(`Unhandled statToEdit: invalid`);
        });
    });

    describe(`method: ${FakemonStatManagerService.setStat.name}`, () =>
    {
        it.each(
            Object.values(FakemonStatsEditStringSelectElementOptions),
        )(`should update the '%s' stat in the fakemon`, async (statToEdit) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const expectedStat = faker.number.int({ min: 1, max: 15 });
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonStatManagerService.setStat({
                messageId,
                fakemon,
                statToEdit,
                stat: expectedStat,
            });

            // Assert
            const expectedStatKey = FakemonStatManagerService.getStatKey(statToEdit);
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    baseStats: {
                        ...fakemon.baseStats,
                        [expectedStatKey]: expectedStat,
                    },
                },
            );
        });

        it('should throw an error if statToEdit is not FakemonStatsEditStringSelectElementOptions', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonStatManagerService.setStat({
                    messageId,
                    fakemon,
                    statToEdit: 'INVALID' as FakemonStatsEditStringSelectElementOptions,
                    stat: 5,
                }),
            ).rejects.toThrow('Unhandled statToEdit: INVALID');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonStatManagerService.swapStats.name}`, () =>
    {
        it.each([
            [FakemonStatsEditStringSelectElementOptions.Attack, FakemonStatsEditStringSelectElementOptions.SpecialAttack],
            [FakemonStatsEditStringSelectElementOptions.Defense, FakemonStatsEditStringSelectElementOptions.SpecialDefense],
            [FakemonStatsEditStringSelectElementOptions.Attack, FakemonStatsEditStringSelectElementOptions.Defense],
            [FakemonStatsEditStringSelectElementOptions.SpecialAttack, FakemonStatsEditStringSelectElementOptions.SpecialDefense],
        ])(`should swap '%s' with '%s'`, async (statToSwap1, statToSwap2) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonStatManagerService.swapStats({
                messageId,
                fakemon,
                statsToSwap: [statToSwap1, statToSwap2],
            });

            // Assert
            const expectedStatKey1 = FakemonStatManagerService.getStatKey(statToSwap1);
            const expectedStatKey2 = FakemonStatManagerService.getStatKey(statToSwap2);
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    baseStats: {
                        ...fakemon.baseStats,
                        [expectedStatKey1]: fakemon.baseStats[expectedStatKey2],
                        [expectedStatKey2]: fakemon.baseStats[expectedStatKey1],
                    },
                },
            );
        });

        it.each([0, 1, 3, 4, 5])('should throw an error if statsToSwap is an array of %s FakemonStatsEditStringSelectElementOptions (AKA: not 2)', async (count) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonStatManagerService.swapStats({
                    messageId,
                    fakemon,
                    statsToSwap: Array.from({ length: count }, () =>
                        faker.helpers.arrayElement(Object.values(FakemonStatsEditStringSelectElementOptions)),
                    ) as [
                        FakemonStatsEditStringSelectElementOptions,
                        FakemonStatsEditStringSelectElementOptions,
                    ],
                }),
            ).rejects.toThrow('Exactly 2 stats must be swapped');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it(`should throw an error if statsToSwap contains an element that's not FakemonStatsEditStringSelectElementOptions`, async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonStatManagerService.swapStats({
                    messageId,
                    fakemon,
                    statsToSwap: [
                        FakemonStatsEditStringSelectElementOptions.Attack,
                        'INVALID' as FakemonStatsEditStringSelectElementOptions,
                    ],
                }),
            ).rejects.toThrow('Unhandled statToEdit: INVALID');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });
});
