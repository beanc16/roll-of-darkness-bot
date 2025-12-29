/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { faker } from '@faker-js/faker';

import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { FakemonCapabilityManagerService } from '../FakemonCapabilityManagerService';

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

// For testing purposes
const createOtherCapabilities = (numOfOtherCapabilities: number): string[] =>
{
    // Create an array of strings that have 1-3 words in them
    return Array.from(
        { length: numOfOtherCapabilities },
        () => faker.word.words({
            count: faker.number.int({ min: 1, max: 3 }),
        }),
    );
};

describe(`class: ${FakemonCapabilityManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${FakemonCapabilityManagerService.updateNumericCapabilities.name}`, () =>
    {
        describe.each([
            'overland',
            'swim',
            'sky',
            'levitate',
            'burrow',
            'highJump',
            'lowJump',
            'power',
        ] as const)('%s', (capabilityToEdit) =>
        {
            it(`should update the '${capabilityToEdit}' capability in the fakemon`, async () =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData();
                const expectedResult = createPtuFakemonCollectionData();
                const expectedCapability = faker.number.int({ min: 0, max: 10 });
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.updateNumericCapabilities({
                    messageId,
                    fakemon,
                    capabilities: {
                        [capabilityToEdit]: expectedCapability,
                    },
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            [capabilityToEdit]: expectedCapability,
                        },
                    },
                );
            });

            it('should throw an error if capability is negative', async () =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData();
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

                // Act & Assert
                await expect(
                    FakemonCapabilityManagerService.updateNumericCapabilities({
                        messageId,
                        fakemon,
                        capabilities: {
                            [capabilityToEdit]: -1,
                        },
                    }),
                ).rejects.toThrow(`Capability "${capabilityToEdit}" cannot be negative`);
                expect(updateSpy).not.toHaveBeenCalled();
            });
        });

        it('should exit early if no numeric capabilities are given', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act
            const result = await FakemonCapabilityManagerService.updateNumericCapabilities({
                messageId,
                fakemon,
                capabilities: {},
            });

            // Act & Assert
            expect(result).toEqual(fakemon);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonCapabilityManagerService.addOtherCapabilities.name}`, () =>
    {
        describe.each([
            [0, [1, 2, 3, 4, 5, 6, 7, 8, 9]],
            [1, [1, 2, 3, 4, 5, 6, 7, 8]],
            [2, [1, 2, 3, 4, 5, 6, 7]],
            [3, [1, 2, 3, 4, 5, 6]],
            [4, [1, 2, 3, 4, 5]],
            [5, [1, 2, 3, 4]],
            [6, [1, 2, 3]],
            [7, [1, 2]],
            [8, [1]],
        ])('%s existing other capabilities', (numOfExistingOtherCapabilities, newCapabilitiesToAdd) =>
        {
            it.each(newCapabilitiesToAdd)(`should add %s other capabilities successfully to the fakemon`, async (numOfNewOtherCapabilities) =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData({ capabilities: { numOfOtherCapabilities: numOfExistingOtherCapabilities } });
                const expectedResult = createPtuFakemonCollectionData();
                const expectedOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.addOtherCapabilities({
                    messageId,
                    fakemon,
                    other: expectedOtherCapabilities,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: [
                                ...(fakemon.capabilities.other || []),
                                ...expectedOtherCapabilities,
                            ],
                        },
                    },
                );
            });

            it(`should exit early if zero other capabilities are provided`, async () =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData({ capabilities: { numOfOtherCapabilities: numOfExistingOtherCapabilities } });
                const expectedResult = createPtuFakemonCollectionData();
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.addOtherCapabilities({
                    messageId,
                    fakemon,
                    other: [],
                });

                // Assert
                expect(result).toEqual(fakemon);
                expect(updateSpy).not.toHaveBeenCalled();
            });

            const oneTooManyOtherCapabilities = newCapabilitiesToAdd[newCapabilitiesToAdd.length - 1] + 1;
            it.each([
                oneTooManyOtherCapabilities,
                oneTooManyOtherCapabilities + 1,
                oneTooManyOtherCapabilities + 2,
            ])(`should throw an error if %s other capabilities are provided (AKA: greater than 9 total)`, async (numOfNewOtherCapabilities) =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData({ capabilities: { numOfOtherCapabilities: numOfExistingOtherCapabilities } });
                const expectedResult = createPtuFakemonCollectionData();
                const expectedOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act & Assert
                await expect(
                    FakemonCapabilityManagerService.addOtherCapabilities({
                        messageId,
                        fakemon,
                        other: expectedOtherCapabilities,
                    }),
                ).rejects.toThrow('Cannot have more than 9 other capabilities');
                expect(updateSpy).not.toHaveBeenCalled();
            });
        });

        describe('undefined other capabilities', () =>
        {
            it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])(`should add %s other capabilities successfully to the fakemon`, async (numOfNewOtherCapabilities) =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData();
                const expectedResult = createPtuFakemonCollectionData();
                const expectedOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.addOtherCapabilities({
                    messageId,
                    fakemon: {
                        ...fakemon,
                        capabilities: {
                            ...fakemon.capabilities,
                            other: undefined,
                        },
                    } as typeof fakemon,
                    other: expectedOtherCapabilities,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: expectedOtherCapabilities,
                        },
                    },
                );
            });
        });
    });

    describe(`method: ${FakemonCapabilityManagerService.setOtherCapabilities.name}`, () =>
    {
        const zeroThroughNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const oneThroughNine = zeroThroughNine.slice(1);
        describe.each(zeroThroughNine)('%s existing capabilities', (numOfExistingOtherCapabilities) =>
        {
            it.each(oneThroughNine)(`should set %s other capabilities successfully on the fakemon`, async (numOfNewOtherCapabilities) =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData({ capabilities: { numOfOtherCapabilities: numOfExistingOtherCapabilities } });
                const expectedResult = createPtuFakemonCollectionData();
                const expectedOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.setOtherCapabilities({
                    messageId,
                    fakemon,
                    other: expectedOtherCapabilities,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: expectedOtherCapabilities,
                        },
                    },
                );
            });

            it(`should exit early if zero other capabilities are provided`, async () =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData({ capabilities: { numOfOtherCapabilities: numOfExistingOtherCapabilities } });
                const expectedResult = createPtuFakemonCollectionData();
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.setOtherCapabilities({
                    messageId,
                    fakemon,
                    other: [],
                });

                // Assert
                expect(result).toEqual(fakemon);
                expect(updateSpy).not.toHaveBeenCalled();
            });

            it.each([10, 11, 12])(`should throw an error if %s other capabilities are provided (AKA: greater than 9 total)`, async (numOfNewOtherCapabilities) =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData({ capabilities: { numOfOtherCapabilities: numOfExistingOtherCapabilities } });
                const expectedResult = createPtuFakemonCollectionData();
                const expectedOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act & Assert
                await expect(
                    FakemonCapabilityManagerService.setOtherCapabilities({
                        messageId,
                        fakemon,
                        other: expectedOtherCapabilities,
                    }),
                ).rejects.toThrow('Cannot have more than 9 other capabilities');
                expect(updateSpy).not.toHaveBeenCalled();
            });
        });

        describe('undefined other capabilities', () =>
        {
            it.each(oneThroughNine)(`should set %s other capabilities successfully on the fakemon`, async (numOfNewOtherCapabilities) =>
            {
                // Arrange
                const messageId = 'messageId';
                const fakemon = createPtuFakemonCollectionData();
                const expectedResult = createPtuFakemonCollectionData();
                const expectedOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.setOtherCapabilities({
                    messageId,
                    fakemon: {
                        ...fakemon,
                        capabilities: {
                            ...fakemon.capabilities,
                            other: undefined,
                        },
                    } as typeof fakemon,
                    other: expectedOtherCapabilities,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: expectedOtherCapabilities,
                        },
                    },
                );
            });
        });
    });
});
