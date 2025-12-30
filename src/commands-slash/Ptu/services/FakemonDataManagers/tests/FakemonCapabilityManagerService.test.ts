/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { faker } from '@faker-js/faker';

import { chunkArray } from '../../../../../services/chunkArray/chunkArray';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { PtuNaturewalk } from '../../../types/pokemon';
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

    const allNaturewalks = Object.values(PtuNaturewalk);
    const naturewalksChunkedByOne = chunkArray({
        array: allNaturewalks,
        shouldMoveToNextChunk: (_, index) => index % 1 === 0 && index !== 0,
    });
    const naturewalksChunkedByTwo = chunkArray({
        array: allNaturewalks,
        shouldMoveToNextChunk: (_, index) => index % 2 === 0 && index !== 0,
    });
    const naturewalksChunkedByThree = chunkArray({
        array: allNaturewalks,
        shouldMoveToNextChunk: (_, index) => index % 3 === 0 && index !== 0,
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
                const inputOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.addOtherCapabilities({
                    messageId,
                    fakemon,
                    other: inputOtherCapabilities,
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
                                ...inputOtherCapabilities,
                            ].sort(),
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
                const inputOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
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
                    other: inputOtherCapabilities,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: inputOtherCapabilities.sort(),
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
                const inputOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
                const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await FakemonCapabilityManagerService.setOtherCapabilities({
                    messageId,
                    fakemon,
                    other: inputOtherCapabilities,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: inputOtherCapabilities.sort(),
                        },
                    },
                );
            });

            it(`should set other capablities to empty array if zero other capabilities are provided`, async () =>
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
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: [],
                        },
                    },
                );
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
                const inputOtherCapabilities = createOtherCapabilities(numOfNewOtherCapabilities);
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
                    other: inputOtherCapabilities,
                });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateSpy).toHaveBeenCalledWith(
                    messageId,
                    { id: fakemon.id },
                    {
                        capabilities: {
                            ...fakemon.capabilities,
                            other: inputOtherCapabilities.sort(),
                        },
                    },
                );
            });
        });
    });

    describe(`method: ${FakemonCapabilityManagerService.setNaturewalk.name}`, () =>
    {
        [
            ['one', naturewalksChunkedByOne],
            ['two', naturewalksChunkedByTwo],
            ['three', naturewalksChunkedByThree],
        ].forEach((curArgs) =>
        {
            const [label, chunkedNaturwalks] = curArgs as [string, PtuNaturewalk[][]];
            describe(`${label} naturewalk${label === 'one' ? '' : 's'}`, () =>
            {
                chunkedNaturwalks.forEach((curNaturewalkChunk) =>
                {
                    describe(`${curNaturewalkChunk.join(', ')}`, () =>
                    {
                        it(`should successfully add the naturewalk capability if it doesn't already have naturewalk`, async () =>
                        {
                            // Arrange
                            const messageId = 'messageId';
                            const fakemon = createPtuFakemonCollectionData({
                                capabilities: {
                                    numOfOtherCapabilities: 3,
                                },
                            });
                            const expectedResult = createPtuFakemonCollectionData();
                            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                                .mockResolvedValue(expectedResult);

                            // Act
                            const result = await FakemonCapabilityManagerService.setNaturewalk({
                                messageId,
                                fakemon,
                                naturewalks: curNaturewalkChunk,
                            });

                            // Act & Assert
                            expect(result).toEqual(expectedResult);
                            expect(updateSpy).toHaveBeenCalledWith(
                                messageId,
                                { id: fakemon.id },
                                {
                                    capabilities: {
                                        ...fakemon.capabilities,
                                        other: [
                                            ...fakemon.capabilities.other!,
                                            `Naturewalk (${curNaturewalkChunk.join(', ')})`,
                                        ].sort(),
                                    },
                                },
                            );
                        });

                        it(`should successfully add the naturewalk capability as the first other capability if other capabilities start as undefined`, async () =>
                        {
                            // Arrange
                            const messageId = 'messageId';
                            const fakemon = createPtuFakemonCollectionData({
                                capabilities: {
                                    numOfOtherCapabilities: 0,
                                },
                            });
                            const expectedResult = createPtuFakemonCollectionData();
                            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                                .mockResolvedValue(expectedResult);

                            // Act
                            const result = await FakemonCapabilityManagerService.setNaturewalk({
                                messageId,
                                fakemon: {
                                    ...fakemon,
                                    capabilities: {
                                        ...fakemon.capabilities,
                                        other: undefined,
                                    },
                                } as typeof fakemon,
                                naturewalks: curNaturewalkChunk,
                            });

                            // Act & Assert
                            expect(result).toEqual(expectedResult);
                            expect(updateSpy).toHaveBeenCalledWith(
                                messageId,
                                { id: fakemon.id },
                                {
                                    capabilities: {
                                        ...fakemon.capabilities,
                                        other: [`Naturewalk (${curNaturewalkChunk.join(', ')})`],
                                    },
                                },
                            );
                        });

                        it(`should successfully insert the naturewalk capability at the same position in the other capabilities if it already has naturewalk`, async () =>
                        {
                            // Arrange
                            const messageId = 'messageId';
                            const fakemon = createPtuFakemonCollectionData({
                                capabilities: {
                                    numOfOtherCapabilities: 3,
                                },
                            });
                            const expectedResult = createPtuFakemonCollectionData();
                            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                                .mockResolvedValue(expectedResult);
                            const inputOtherCapabilities = [
                                fakemon.capabilities.other![0],
                                `Naturewalk (${curNaturewalkChunk.join(', ')})`,
                                ...fakemon.capabilities.other!.slice(1),
                            ].sort();

                            // Act
                            const result = await FakemonCapabilityManagerService.setNaturewalk({
                                messageId,
                                fakemon: {
                                    ...fakemon,
                                    capabilities: {
                                        ...fakemon.capabilities,
                                        other: inputOtherCapabilities,
                                    },
                                } as typeof fakemon,
                                naturewalks: curNaturewalkChunk,
                            });

                            // Act & Assert
                            expect(result).toEqual(expectedResult);
                            expect(updateSpy).toHaveBeenCalledWith(
                                messageId,
                                { id: fakemon.id },
                                {
                                    capabilities: {
                                        ...fakemon.capabilities,
                                        other: inputOtherCapabilities,
                                    },
                                },
                            );
                        });

                        it(`should not mutate the fakemon's other capabilities`, async () =>
                        {
                            // Arrange
                            const messageId = 'messageId';
                            const fakemon = createPtuFakemonCollectionData({
                                capabilities: {
                                    numOfOtherCapabilities: 3,
                                },
                            });
                            const originalOtherCapabilities = [...fakemon.capabilities.other!];

                            // Act
                            await FakemonCapabilityManagerService.setNaturewalk({
                                messageId,
                                fakemon: {
                                    ...fakemon,
                                    capabilities: {
                                        ...fakemon.capabilities,
                                        other: [
                                            fakemon.capabilities.other![0],
                                            `Naturewalk (${curNaturewalkChunk.join(', ')})`,
                                            ...fakemon.capabilities.other!.slice(1),
                                        ],
                                    },
                                } as typeof fakemon,
                                naturewalks: curNaturewalkChunk,
                            });

                            // Act & Assert
                            expect(originalOtherCapabilities).toEqual(fakemon.capabilities.other);
                        });
                    });
                });
            });
        });

        it('should exit early if no naturewalk values are provided and none existed previously', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                capabilities: {
                    numOfOtherCapabilities: 3,
                },
            });
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonCapabilityManagerService.setNaturewalk({
                messageId,
                fakemon,
                naturewalks: [],
            });

            // Act & Assert
            expect(result).toEqual(fakemon);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should remove naturewalk if no naturewalk values are provided and one existed previously', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                capabilities: {
                    numOfOtherCapabilities: 3,
                },
            });
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonCapabilityManagerService.setNaturewalk({
                messageId,
                fakemon: {
                    ...fakemon,
                    capabilities: {
                        ...fakemon.capabilities,
                        other: [
                            ...fakemon.capabilities.other!,
                            `Naturewalk (${PtuNaturewalk.Beach})`,
                        ],
                    },
                } as typeof fakemon,
                naturewalks: [],
            });

            // Act & Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    capabilities: {
                        ...fakemon.capabilities,
                        other: fakemon.capabilities.other!.sort(), // No naturewalk, just the original other capabilities
                    },
                },
            );
        });

        it('should throw an error if more than 3 naturewalk values are provided', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                capabilities: {
                    numOfOtherCapabilities: 3,
                },
            });
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act & Assert
            await expect(
                FakemonCapabilityManagerService.setNaturewalk({
                    messageId,
                    fakemon,
                    naturewalks: [PtuNaturewalk.Beach, PtuNaturewalk.Cave, PtuNaturewalk.Desert, PtuNaturewalk.Forest],
                }),
            ).rejects.toThrow(`Cannot have more than 3 naturewalk values`);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if more than 9 other capabilities will exist when adding naturewalk', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                capabilities: {
                    numOfOtherCapabilities: 9,
                },
            });
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act & Assert
            await expect(
                FakemonCapabilityManagerService.setNaturewalk({
                    messageId,
                    fakemon,
                    naturewalks: [PtuNaturewalk.Beach],
                }),
            ).rejects.toThrow(`Cannot have more than 9 other capabilities`);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if duplicate naturewalk values are provided', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData({
                capabilities: {
                    numOfOtherCapabilities: 3,
                },
            });
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act & Assert
            await expect(
                FakemonCapabilityManagerService.setNaturewalk({
                    messageId,
                    fakemon,
                    naturewalks: [PtuNaturewalk.Beach, PtuNaturewalk.Beach],
                }),
            ).rejects.toThrow(`Cannot have duplicate naturewalk values`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonCapabilityManagerService.findNaturewalkValues.name}`, () =>
    {
        [
            ['one', naturewalksChunkedByOne],
            ['two', naturewalksChunkedByTwo],
            ['three', naturewalksChunkedByThree],
        ].forEach((curArgs) =>
        {
            const [label, chunkedNaturwalks] = curArgs as [string, PtuNaturewalk[][]];
            describe(`${label} naturewalk${label === 'one' ? '' : 's'}`, () =>
            {
                chunkedNaturwalks.forEach((curNaturewalkChunk) =>
                {
                    describe(`${curNaturewalkChunk.join(', ')}`, () =>
                    {
                        it(`should return the naturewalk value${label === 'one' ? '' : 's'} if naturewalk is the only other capability`, () =>
                        {
                            // Arrange
                            const fakemon = createPtuFakemonCollectionData({
                                capabilities: {
                                    numOfOtherCapabilities: 3,
                                },
                            });

                            // Act
                            const result = FakemonCapabilityManagerService.findNaturewalkValues({
                                ...fakemon,
                                capabilities: {
                                    ...fakemon.capabilities,
                                    other: [`Naturewalk (${curNaturewalkChunk.join(', ')})`],
                                },
                            } as typeof fakemon);

                            // Act & Assert
                            expect(result).toEqual(curNaturewalkChunk);
                        });

                        it(`should return the naturewalk value${label === 'one' ? '' : 's'} if multiple other capabilities exist`, () =>
                        {
                            // Arrange
                            const fakemon = createPtuFakemonCollectionData({
                                capabilities: {
                                    numOfOtherCapabilities: 3,
                                },
                            });

                            // Act
                            const result = FakemonCapabilityManagerService.findNaturewalkValues({
                                ...fakemon,
                                capabilities: {
                                    ...fakemon.capabilities,
                                    other: [
                                        ...fakemon.capabilities.other!,
                                        `Naturewalk (${curNaturewalkChunk.join(', ')})`,
                                    ],
                                },
                            } as typeof fakemon);

                            // Act & Assert
                            expect(result).toEqual(curNaturewalkChunk);
                        });
                    });
                });
            });
        });

        // This ensures that the typecast from string to enum is safe with proper string formatting
        it(`should return naturewalk values that match the PtuNaturewalk enum`, () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({
                capabilities: {
                    numOfOtherCapabilities: 3,
                },
            });

            // Act
            const result = FakemonCapabilityManagerService.findNaturewalkValues({
                ...fakemon,
                capabilities: {
                    ...fakemon.capabilities,
                    other: [`Naturewalk (${allNaturewalks.join(', ')})`],
                },
            } as typeof fakemon);

            // Act & Assert
            expect(result).toEqual(allNaturewalks);
        });

        it('should exit early if no naturewalk values are provided', () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({
                capabilities: {
                    numOfOtherCapabilities: 3,
                },
            });

            // Act
            const result = FakemonCapabilityManagerService.findNaturewalkValues(fakemon);

            // Act & Assert
            expect(result).toEqual([]);
        });

        it(`should exit early if naturewalk doesn't have parenthesis`, () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData();

            // Act
            const result = FakemonCapabilityManagerService.findNaturewalkValues({
                ...fakemon,
                capabilities: {
                    ...fakemon.capabilities,
                    other: [`Naturewalk ${PtuNaturewalk.Beach}`],
                },
            } as typeof fakemon);

            // Act & Assert
            expect(result).toEqual([]);
        });

        it(`should exit early if other capabilities are an empty array`, () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData();

            // Act
            const result = FakemonCapabilityManagerService.findNaturewalkValues({
                ...fakemon,
                capabilities: {
                    ...fakemon.capabilities,
                    other: [] as string[],
                },
            } as typeof fakemon);

            // Act & Assert
            expect(result).toEqual([]);
        });

        it(`should exit early if other capabilities are undefined`, () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData();

            // Act
            const result = FakemonCapabilityManagerService.findNaturewalkValues({
                ...fakemon,
                capabilities: {
                    ...fakemon.capabilities,
                    other: undefined,
                },
            } as typeof fakemon);

            // Act & Assert
            expect(result).toEqual([]);
        });
    });

    describe(`method: ${FakemonCapabilityManagerService.formatNaturewalkValuesAsCapabilityName.name}`, () =>
    {
        it('should return undefined if no naturewalk values are provided', () =>
        {
            // Arrange
            const args: PtuNaturewalk[] = [];

            // Act
            const result = FakemonCapabilityManagerService.formatNaturewalkValuesAsCapabilityName(args);

            // Assert
            expect(result).toBeUndefined();
        });

        [
            ['one', naturewalksChunkedByOne],
            ['two', naturewalksChunkedByTwo],
            ['three', naturewalksChunkedByThree],
        ].forEach((curArgs) =>
        {
            const [label, chunkedNaturwalks] = curArgs as [string, PtuNaturewalk[][]];
            describe(`${label} naturewalk${label === 'one' ? '' : 's'}`, () =>
            {
                chunkedNaturwalks.forEach((curNaturewalkChunk) =>
                {
                    describe(`${curNaturewalkChunk.join(', ')}`, () =>
                    {
                        it('should return the formatted naturewalk capability', () =>
                        {
                            // Act
                            const result = FakemonCapabilityManagerService.formatNaturewalkValuesAsCapabilityName(curNaturewalkChunk);

                            // Assert
                            expect(result).toBe(`Naturewalk (${curNaturewalkChunk.join(', ')})`);
                        });
                    });
                });
            });
        });
    });
});
