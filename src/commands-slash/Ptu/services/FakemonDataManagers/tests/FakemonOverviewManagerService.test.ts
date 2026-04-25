/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { faker } from '@faker-js/faker';

import { FakemonLevelUpMoveDistributionEmbedMessage } from '../../../components/fakemon/embeds/FakemonLevelUpMoveDistributionEmbedMessage';
import { getPokemonWithMove, type PtuPokemonForLookupPokemon } from '../../../embed-messages/lookup';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { createPtuMoveData } from '../../../fakes/PtuMove.fakes';
import { PtuSubcommandGroup } from '../../../options';
import { PtuLookupSubcommand } from '../../../options/lookup';
import { LookupMoveStrategy } from '../../../strategies/lookup/LookupMoveStrategy';
import { LookupPokemonStrategy } from '../../../strategies/lookup/LookupPokemonStrategy';
import { PokemonType } from '../../../types/pokemon';
import type { PtuStrategyMap } from '../../../types/strategies';
import { FakemonOverviewManagerService } from '../FakemonOverviewManagerService';

jest.mock('../../../strategies/lookup/LookupMoveStrategy', () => ({
    LookupMoveStrategy: {
        getLookupData: jest.fn(),
    },
}));
jest.mock('../../../strategies/lookup/LookupPokemonStrategy', () => ({
    LookupPokemonStrategy: {
        getLookupData: jest.fn(),
    },
}));
jest.mock('../../../embed-messages/lookup', () => ({
    getPokemonWithMove: jest.fn(),
}));
jest.mock('../../../components/fakemon/embeds/FakemonLevelUpMoveDistributionEmbedMessage', () => ({
    FakemonLevelUpMoveDistributionEmbedMessage: jest.fn(),
}));

const MockedFakemonLevelUpMoveDistributionEmbedMessage = FakemonLevelUpMoveDistributionEmbedMessage;

describe(`class: ${FakemonOverviewManagerService.name}`, () =>
{
    describe(`method: ${FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed.name}`, () =>
    {
        let strategies: PtuStrategyMap;
        let getLookupMoveSpy: jest.SpyInstance;
        let getLookupPokemonSpy: jest.SpyInstance;

        const stubPokemonList: PtuPokemonForLookupPokemon[] = [{} as PtuPokemonForLookupPokemon];
        const getPokemonWithMoveMock = getPokemonWithMove;

        beforeEach(() =>
        {
            jest.clearAllMocks();

            strategies = {
                [PtuSubcommandGroup.Lookup]: {
                    [PtuLookupSubcommand.Move]: LookupMoveStrategy,
                    [PtuLookupSubcommand.Pokemon]: LookupPokemonStrategy,
                },
            } as unknown as PtuStrategyMap;

            getLookupMoveSpy = jest.spyOn(LookupMoveStrategy, 'getLookupData').mockResolvedValue([]);
            getLookupPokemonSpy = jest.spyOn(LookupPokemonStrategy, 'getLookupData').mockResolvedValue(stubPokemonList);
        });

        it('returns undefined when no pokemon with level up moves are found', async () =>
        {
            getLookupPokemonSpy.mockResolvedValue([]);
            const fakemon = createPtuFakemonCollectionData();

            const result = await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({
                strategies,
                fakemon,
            });

            expect(result).toBeUndefined();
        });

        describe('bucket distribution', () =>
        {
            it.each([
                ['lessThanOrEqual16', 1, 17], // diff = -16 (boundary)
                ['lessThanOrEqual11', 1, 12], // diff = -11 (boundary)
                ['lessThanOrEqual6', 1, 7], // diff = -6  (boundary)
                ['avg', 5, 5], // diff =  0
                ['greaterThanOrEqual6', 10, 4],  // diff = +6  (boundary)
                ['greaterThanOrEqual11', 15, 4],  // diff = +11 (boundary)
                ['greaterThanOrEqual16', 20, 4],  // diff = +16 (boundary)
            ] as const)(
                'places a move in the %s bucket at the boundary level difference',
                async (bucket, fakeLevel, mockAverageLevel) =>
                {
                    // Arrange
                    const move = createPtuMoveData();
                    const fakemon = createPtuFakemonCollectionData();
                    fakemon.moveList.levelUp = [{
                        move: move.name,
                        level: fakeLevel,
                        type: PokemonType.Normal,
                    }];

                    getLookupMoveSpy.mockResolvedValue([move]);
                    getPokemonWithMoveMock.mockReturnValue({
                        averageLevel: mockAverageLevel,
                        levelUp: stubPokemonList,
                    });

                    // Act
                    await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({ strategies, fakemon });

                    // Assert
                    expect(MockedFakemonLevelUpMoveDistributionEmbedMessage).toHaveBeenCalledWith(
                    fakemon.name,
                        expect.objectContaining({
                            [bucket]: expect.arrayContaining([
                                expect.objectContaining({
                                    moveName: move.name,
                                    level: fakeLevel,
                                    averageLevel: mockAverageLevel,
                                }),
                            ]),
                        }),
                    );
                },
            );

            it('places a move with a non-numeric level in the outliers bucket', async () =>
            {
                // Arrange
                const moveName = faker.lorem.word();
                const fakemon = createPtuFakemonCollectionData();
                fakemon.moveList.levelUp = [{
                    move: moveName,
                    level: 'Evo',
                    type: PokemonType.Normal,
                }];

                getLookupMoveSpy.mockResolvedValue([createPtuMoveData({ name: moveName })]);

                // Act
                await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({ strategies, fakemon });

                // Assert
                expect(MockedFakemonLevelUpMoveDistributionEmbedMessage).toHaveBeenCalledWith(
                    fakemon.name,
                    expect.objectContaining({
                        outliers: expect.arrayContaining([
                            expect.objectContaining({ moveName, level: 0 }),
                        ]),
                    }),
                );
            });
        });

        describe('basedOn move fallback', () =>
        {
            it('uses basedOn average level for bucketing when the original move is not learned by level up', async () =>
            {
                // Arrange
                const moveName = faker.lorem.word();
                const basedOnMoveName = faker.lorem.word();
                const fakemon = createPtuFakemonCollectionData();
                fakemon.moveList.levelUp = [{
                    move: moveName,
                    level: 10,
                    type: PokemonType.Normal,
                }];

                getLookupMoveSpy
                    .mockResolvedValueOnce([createPtuMoveData({ name: moveName, basedOn: basedOnMoveName })])
                    .mockResolvedValueOnce([createPtuMoveData({ name: basedOnMoveName })]);

                getPokemonWithMoveMock
                    .mockReturnValueOnce({ averageLevel: 0, levelUp: [] })             // original: not learned by level up
                    .mockReturnValueOnce({ averageLevel: 4, levelUp: stubPokemonList }); // basedOn: learned, diff = 10 - 4 = +6

                // Act
                await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({ strategies, fakemon });

                // Assert: diff = +6 → greaterThanOrEqual6; basedOn metadata populated
                expect(MockedFakemonLevelUpMoveDistributionEmbedMessage).toHaveBeenCalledWith(
                    fakemon.name,
                    expect.objectContaining({
                        greaterThanOrEqual6: expect.arrayContaining([
                            expect.objectContaining({
                                moveName,
                                basedOnMove: basedOnMoveName,
                                basedOnAverageLevel: 4,
                            }),
                        ]),
                    }),
                );
            });

            it('places a move in outliers when neither the move nor its basedOn is learned by level up', async () =>
            {
                // Arrange
                const moveName = faker.lorem.word();
                const basedOnMoveName = faker.lorem.word();
                const fakemon = createPtuFakemonCollectionData();
                fakemon.moveList.levelUp = [{
                    move: moveName,
                    level: 10,
                    type: PokemonType.Normal,
                }];

                getLookupMoveSpy
                    .mockResolvedValueOnce([createPtuMoveData({ name: moveName, basedOn: basedOnMoveName })])
                    .mockResolvedValueOnce([createPtuMoveData({ name: basedOnMoveName })]);

                getPokemonWithMoveMock.mockReturnValue({ averageLevel: 0, levelUp: [] });

                // Act
                await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({ strategies, fakemon });

                // Assert
                expect(MockedFakemonLevelUpMoveDistributionEmbedMessage).toHaveBeenCalledWith(
                    fakemon.name,
                    expect.objectContaining({
                        outliers: expect.arrayContaining([
                            expect.objectContaining({ moveName }),
                        ]),
                    }),
                );
            });
        });

        describe('average deviation', () =>
        {
            it('calculates avgDeviation as the mean level difference across all learned-by-level-up moves', async () =>
            {
                // Arrange: diff = +2 and +4 → mean = 3
                const move1Name = faker.lorem.word();
                const move2Name = faker.lorem.word();
                const fakemon = createPtuFakemonCollectionData();
                fakemon.moveList.levelUp = [
                    {
                        move: move1Name,
                        level: 5,
                        type: PokemonType.Normal,
                    },
                    {
                        move: move2Name,
                        level: 10,
                        type: PokemonType.Normal,
                    },
                ];

                getLookupMoveSpy.mockResolvedValue([
                    createPtuMoveData({ name: move1Name }),
                    createPtuMoveData({ name: move2Name }),
                ]);
                getPokemonWithMoveMock
                    .mockReturnValueOnce({ averageLevel: 3, levelUp: stubPokemonList }) // diff = +2
                    .mockReturnValueOnce({ averageLevel: 6, levelUp: stubPokemonList }); // diff = +4

                // Act
                await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({ strategies, fakemon });

                // Assert
                expect(MockedFakemonLevelUpMoveDistributionEmbedMessage).toHaveBeenCalledWith(
                    fakemon.name,
                    expect.objectContaining({ avgDeviation: 3 }),
                );
            });

            it('returns 0 for avgDeviation when no moves are learned by level up', async () =>
            {
                // Arrange
                const moveName = faker.lorem.word();
                const fakemon = createPtuFakemonCollectionData();
                fakemon.moveList.levelUp = [{
                    move: moveName,
                    level: 10,
                    type: PokemonType.Normal,
                }];

                getLookupMoveSpy.mockResolvedValue([createPtuMoveData({ name: moveName })]);
                getPokemonWithMoveMock.mockReturnValue({ averageLevel: 0, levelUp: [] });

                // Act
                await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({ strategies, fakemon });

                // Assert — currently returns NaN; should return 0
                expect(MockedFakemonLevelUpMoveDistributionEmbedMessage).toHaveBeenCalledWith(
                    fakemon.name,
                    expect.objectContaining({ avgDeviation: 0 }),
                );
            });

            it('calculates avgDeviationBasedOn using the basedOn average level when a basedOn move exists', async () =>
            {
                // Arrange: move at lvl 10, basedOn avg = 4 → diff = +6; mean = 6
                const moveName = faker.lorem.word();
                const basedOnMoveName = faker.lorem.word();
                const fakemon = createPtuFakemonCollectionData();
                fakemon.moveList.levelUp = [{
                    move: moveName,
                    level: 10,
                    type: PokemonType.Normal,
                }];

                getLookupMoveSpy
                    .mockResolvedValueOnce([createPtuMoveData({ name: moveName, basedOn: basedOnMoveName })])
                    .mockResolvedValueOnce([createPtuMoveData({ name: basedOnMoveName })]);

                getPokemonWithMoveMock
                    .mockReturnValueOnce({ averageLevel: 10, levelUp: stubPokemonList }) // original: learned, diff = 0
                    .mockReturnValueOnce({ averageLevel: 4, levelUp: stubPokemonList }); // basedOn: learned, basedOn diff = +6

                // Act
                await FakemonOverviewManagerService.getLevelUpMoveDistributionEmbed({ strategies, fakemon });

                // Assert
                expect(MockedFakemonLevelUpMoveDistributionEmbedMessage).toHaveBeenCalledWith(
                    fakemon.name,
                    expect.objectContaining({ avgDeviationBasedOn: 6 }),
                );
            });
        });
    });
});
