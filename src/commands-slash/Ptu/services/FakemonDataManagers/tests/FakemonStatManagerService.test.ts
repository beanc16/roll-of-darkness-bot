/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { logger } from '@beanc16/logger';
import { faker } from '@faker-js/faker';

import { FakemonStatsEditStringSelectElementOptions } from '../../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { FakemonStatManagerService } from '../FakemonStatManagerService';
import { FakemonCapabilityManagerService } from '../FakemonCapabilityManagerService';

jest.mock('@beanc16/logger');
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
jest.mock('../FakemonCapabilityManagerService', () =>
{
    return {
        FakemonCapabilityManagerService: {
            addOtherCapabilities: jest.fn(),
            removeOtherCapabilities: jest.fn(),
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
            jest.spyOn(FakemonCapabilityManagerService, 'addOtherCapabilities')
                .mockResolvedValue(expectedResult);
            jest.spyOn(FakemonCapabilityManagerService, 'removeOtherCapabilities')
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

        it.each(
            Object.values(FakemonStatsEditStringSelectElementOptions),
        )(`should update the '%s' stat and add the Underdog capability to fakemon <= 45 BST`, async (statToEdit) =>
        {
            // Arrange - Data
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                baseStats: { bst: 45 },
                capabilities: { numOfOtherCapabilities: 0 },
            });
            const expectedStatKey = FakemonStatManagerService.getStatKey(statToEdit);
            const expectedStat = fakemon.baseStats[expectedStatKey] - 1; // Always lower the stat to keep the bst below 45
            const expectedUpdateResult = {
                ...fakemon,
                baseStats: {
                    ...fakemon.baseStats,
                    [expectedStatKey]: expectedStat,
                },
            } as typeof fakemon;
            const expectedResult = {
                ...expectedUpdateResult,
                capabilities: {
                    ...fakemon.capabilities,
                    other: [
                        ...(fakemon.capabilities.other || []),
                        'Underdog',
                    ].sort(),
                },
            } as typeof fakemon;

            // Arrange - Mocks
            jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedUpdateResult);
            const addOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'addOtherCapabilities')
                .mockResolvedValue(expectedResult);
            const removeOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'removeOtherCapabilities')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonStatManagerService.setStat({
                messageId,
                fakemon,
                statToEdit,
                stat: expectedStat,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(addOtherCapabilitiesSpy).toHaveBeenCalledWith({
                messageId,
                fakemon: expectedUpdateResult,
                other: ['Underdog'],
            });
            expect(removeOtherCapabilitiesSpy).not.toHaveBeenCalled();
        });

        it.each(
            Object.values(FakemonStatsEditStringSelectElementOptions),
        )(`should update the '%s' stat and should not add the Underdog capability to fakemon <= 45 BST if they already have Underdog`, async (statToEdit) =>
        {
            // Arrange - Data
            const messageId = 'messageId';
            const initialFakemon = createPtuFakemonCollectionData({
                baseStats: { bst: 45 },
                capabilities: { numOfOtherCapabilities: 0 },
            });
            const fakemon = {
                ...initialFakemon,
                capabilities: {
                    ...initialFakemon.capabilities,
                    other: ['Underdog'], // Include Underdog
                },
            } as typeof initialFakemon;
            const expectedStatKey = FakemonStatManagerService.getStatKey(statToEdit);
            const expectedStat = fakemon.baseStats[expectedStatKey] - 1; // Always lower the stat to keep the bst below 45
            const expectedResult = {
                ...fakemon,
                baseStats: {
                    ...fakemon.baseStats,
                    [expectedStatKey]: expectedStat,
                },
            } as typeof fakemon;

            // Arrange - Mocks
            jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const addOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'addOtherCapabilities')
                .mockResolvedValue(expectedResult);
            const removeOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'removeOtherCapabilities')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonStatManagerService.setStat({
                messageId,
                fakemon,
                statToEdit,
                stat: expectedStat,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(addOtherCapabilitiesSpy).not.toHaveBeenCalled();
            expect(removeOtherCapabilitiesSpy).not.toHaveBeenCalled();
        });

        it.each(
            Object.values(FakemonStatsEditStringSelectElementOptions),
        )(`sshould log & rethrow error if updating the '%s' stat succeeds but adding the Underdog capability to fakemon <= 45 BST fails`, async (statToEdit) =>
        {
            // Arrange - Data
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                baseStats: { bst: 45 },
                capabilities: { numOfOtherCapabilities: 0 },
            });
            const expectedStatKey = FakemonStatManagerService.getStatKey(statToEdit);
            const expectedStat = fakemon.baseStats[expectedStatKey] - 1; // Always lower the stat to keep the bst below 45
            const expectedUpdateResult = {
                ...fakemon,
                baseStats: {
                    ...fakemon.baseStats,
                    [expectedStatKey]: expectedStat,
                },
            } as typeof fakemon;
            const expectedResult = {
                ...expectedUpdateResult,
                capabilities: {
                    ...fakemon.capabilities,
                    other: [
                        ...(fakemon.capabilities.other || []),
                        'Underdog',
                    ].sort(),
                },
            } as typeof fakemon;
            const errorMessage = 'Successfully updated stats, but failed to add underdog capability';

            // Arrange - Mocks
            const loggerWarnSpy = jest.spyOn(logger, 'warn');
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedUpdateResult);
            const addOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'addOtherCapabilities')
                .mockRejectedValue(new Error('Fake error'));
            const removeOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'removeOtherCapabilities')
                .mockResolvedValue(expectedResult);

            // Act & Assert
            await expect(
                FakemonStatManagerService.setStat({
                    messageId,
                    fakemon,
                    statToEdit,
                    stat: expectedStat,
                }),
            ).rejects.toThrow(errorMessage);
            expect(updateSpy).toHaveBeenCalled();
            expect(updateSpy).not.toThrow();
            expect(addOtherCapabilitiesSpy).toHaveBeenCalled();
            await expect(addOtherCapabilitiesSpy).rejects.toThrow('Fake error');
            expect(removeOtherCapabilitiesSpy).not.toHaveBeenCalled();
            expect(removeOtherCapabilitiesSpy).not.toThrow();
            expect(loggerWarnSpy).toHaveBeenCalledWith(errorMessage, new Error('Fake error'));
        });

        it.each(
            Object.values(FakemonStatsEditStringSelectElementOptions),
        )(`should update the '%s' stat and remove the Underdog capability from fakemon > 45 BST`, async (statToEdit) =>
        {
            // Arrange - Data
            const messageId = 'messageId';
            const initialFakemon = createPtuFakemonCollectionData({
                baseStats: { bst: 46 },
                capabilities: { numOfOtherCapabilities: 0 },
            });
            const fakemon = {
                ...initialFakemon,
                capabilities: {
                    ...initialFakemon.capabilities,
                    other: ['Underdog'], // Include Underdog
                },
            } as typeof initialFakemon;
            const expectedStatKey = FakemonStatManagerService.getStatKey(statToEdit);
            const expectedStat = fakemon.baseStats[expectedStatKey] + 1; // Always raise the stat to keep the bst above 45
            const expectedUpdateResult = {
                ...fakemon,
                baseStats: {
                    ...fakemon.baseStats,
                    [expectedStatKey]: expectedStat,
                },
            } as typeof fakemon;
            const expectedResult = {
                ...expectedUpdateResult,
                capabilities: {
                    ...fakemon.capabilities,
                    other: [
                        ...(fakemon.capabilities.other || []),
                        'Underdog',
                    ].sort(),
                },
            } as typeof fakemon;

            // Arrange - Mocks
            jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedUpdateResult);
            const addOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'addOtherCapabilities')
                .mockResolvedValue(expectedResult);
            const removeOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'removeOtherCapabilities')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonStatManagerService.setStat({
                messageId,
                fakemon,
                statToEdit,
                stat: expectedStat,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(addOtherCapabilitiesSpy).not.toHaveBeenCalled();
            expect(removeOtherCapabilitiesSpy).toHaveBeenCalledWith({
                messageId,
                fakemon: expectedUpdateResult,
                other: ['Underdog'],
            });
        });

        it.each(
            Object.values(FakemonStatsEditStringSelectElementOptions),
        )(`should update the '%s' stat and should not remove the Underdog capability from fakemon > 45 BST if they do not have Underdog already`, async (statToEdit) =>
        {
            // Arrange - Data
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                baseStats: { bst: 46 },
                capabilities: { numOfOtherCapabilities: 0 },
            });
            const expectedStatKey = FakemonStatManagerService.getStatKey(statToEdit);
            const expectedStat = fakemon.baseStats[expectedStatKey] + 1; // Always raise the stat to keep the bst above 45
            const expectedResult = {
                ...fakemon,
                baseStats: {
                    ...fakemon.baseStats,
                    [expectedStatKey]: expectedStat,
                },
            } as typeof fakemon;

            // Arrange - Mocks
            jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const addOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'addOtherCapabilities')
                .mockResolvedValue(expectedResult);
            const removeOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'removeOtherCapabilities')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonStatManagerService.setStat({
                messageId,
                fakemon,
                statToEdit,
                stat: expectedStat,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(addOtherCapabilitiesSpy).not.toHaveBeenCalled();
            expect(removeOtherCapabilitiesSpy).not.toHaveBeenCalled();
        });

        it.each(
            Object.values(FakemonStatsEditStringSelectElementOptions),
        )(`should log & rethrow error if updating the '%s' stat succeeds but removing the Underdog capability from fakemon > 45 BST fails`, async (statToEdit) =>
        {
            // Arrange - Data
            const messageId = 'messageId';
            const initialFakemon = createPtuFakemonCollectionData({
                baseStats: { bst: 46 },
                capabilities: { numOfOtherCapabilities: 0 },
            });
            const fakemon = {
                ...initialFakemon,
                capabilities: {
                    ...initialFakemon.capabilities,
                    other: ['Underdog'], // Include Underdog
                },
            } as typeof initialFakemon;
            const expectedStatKey = FakemonStatManagerService.getStatKey(statToEdit);
            const expectedStat = fakemon.baseStats[expectedStatKey] + 1; // Always raise the stat to keep the bst above 45
            const expectedUpdateResult = {
                ...fakemon,
                baseStats: {
                    ...fakemon.baseStats,
                    [expectedStatKey]: expectedStat,
                },
            } as typeof fakemon;
            const expectedResult = {
                ...expectedUpdateResult,
                capabilities: {
                    ...fakemon.capabilities,
                    other: [
                        ...(fakemon.capabilities.other || []),
                        'Underdog',
                    ].sort(),
                },
            } as typeof fakemon;
            const errorMessage = 'Successfully updated stats, but failed to remove Underdog capability';

            // Arrange - Mocks
            const loggerWarnSpy = jest.spyOn(logger, 'warn');
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedUpdateResult);
            const addOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'addOtherCapabilities')
                .mockResolvedValue(expectedResult);
            const removeOtherCapabilitiesSpy = jest.spyOn(FakemonCapabilityManagerService, 'removeOtherCapabilities')
                .mockRejectedValue(new Error('Fake error'));

            // Act & Assert
            await expect(
                FakemonStatManagerService.setStat({
                    messageId,
                    fakemon,
                    statToEdit,
                    stat: expectedStat,
                }),
            ).rejects.toThrow(errorMessage);
            expect(updateSpy).toHaveBeenCalled();
            expect(updateSpy).not.toThrow();
            expect(addOtherCapabilitiesSpy).not.toHaveBeenCalled();
            expect(addOtherCapabilitiesSpy).not.toThrow();
            expect(removeOtherCapabilitiesSpy).toHaveBeenCalled();
            await expect(removeOtherCapabilitiesSpy).rejects.toThrow('Fake error');
            expect(loggerWarnSpy).toHaveBeenCalledWith(errorMessage, new Error('Fake error'));
        });

        it('should throw an error if stat is negative', async () =>
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
                    statToEdit: FakemonStatsEditStringSelectElementOptions.HP,
                    stat: -1,
                }),
            ).rejects.toThrow('Stat cannot be negative');
            expect(updateSpy).not.toHaveBeenCalled();
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

    describe(`method: ${FakemonStatManagerService['getBst'].name}`, () =>
    {
        it('should calculate the base stat total of a fakemon', () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData();

            // Act
            const result = FakemonStatManagerService['getBst'](fakemon);

            // Arrange
            expect(result).toEqual(
                fakemon.baseStats.hp
                + fakemon.baseStats.attack
                + fakemon.baseStats.defense
                + fakemon.baseStats.specialAttack
                + fakemon.baseStats.specialDefense
                + fakemon.baseStats.speed,
            );
        });
    });
});
