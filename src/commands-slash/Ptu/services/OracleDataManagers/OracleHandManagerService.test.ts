/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */

import { PtuOracleCardProphecyFace } from '../../dal/models/PtuOracleCardCollection.js';
import {
    PtuOracleCardAction,
    PtuOracleGameStatus,
    PtuOracleGameTime,
    PtuOraclePlayerHand,
} from '../../dal/models/PtuOracleGameCollection.js';
import { PtuOraclePseudoCache } from '../../dal/PtuOraclePseudoCache.js';
import {
    bulkCreatePtuOracleCardCollectionData,
    createPtuOracleCardCollectionData,
    createPtuOracleCardDrawData,
    createPtuOracleGameCollectionData,
    createPtuOraclePlayerHandData,
} from '../../fakes/PtuOracleCollections.fakes.js';
import { OracleHandManagerService } from './OracleHandManagerService.js';

const mockRoll = jest.fn().mockReturnValue([1]);

jest.mock('../../dal/PtuOraclePseudoCache.js', () => ({
    PtuOraclePseudoCache: {
        updateGame: jest.fn(),
        getCards: jest.fn(),
        getAllCards: jest.fn(),
    },
}));

jest.mock('../../../../services/Dice/DiceLiteService.js', () => ({
    DiceLiteService: jest.fn().mockImplementation(() => ({
        roll: mockRoll,
    })),
}));

const updateGameMock = PtuOraclePseudoCache.updateGame as jest.MockedFunction<typeof PtuOraclePseudoCache.updateGame>;
const getCardsMock = PtuOraclePseudoCache.getCards as jest.MockedFunction<typeof PtuOraclePseudoCache.getCards>;
const getAllCardsMock = PtuOraclePseudoCache.getAllCards as jest.MockedFunction<typeof PtuOraclePseudoCache.getAllCards>;

const getExistingHands = (): PtuOraclePlayerHand[] => [
    createPtuOraclePlayerHandData({
        past: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.Accepted })],
        present: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.Accepted })],
        future: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.Accepted })],
    }),
    createPtuOraclePlayerHandData({
        past: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.Denied }), createPtuOracleCardDrawData({ action: PtuOracleCardAction.Accepted })],
        present: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.Questioned }), createPtuOracleCardDrawData({ action: PtuOracleCardAction.Accepted })],
        future: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.Accepted })],
    }),
];

describe(`class: ${OracleHandManagerService.name}`, () =>
{
    const allGameTimes = Object.values(PtuOracleGameTime);

    beforeEach(() =>
    {
        mockRoll.mockReturnValue([1]);
        jest.clearAllMocks();
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    describe(`method: ${OracleHandManagerService.createNewHand.name}`, () =>
    {
        it('adds a new hand and sets playerDiscordUserIds when there is no current hand', async () =>
        {
            // Arrange
            const existingPlayerId = 'player1';
            const newPlayerId = 'player2';
            const topic = 'What is life?';
            const game = createPtuOracleGameCollectionData({
                hands: [],
                playerDiscordUserIds: [existingPlayerId],
                discardCardNumbers: [],
            });
            const expectedResult = createPtuOracleGameCollectionData();
            updateGameMock.mockResolvedValue(expectedResult);

            // Act
            const result = await OracleHandManagerService.createNewHand(
                {
                    id: game.id,
                    hands: game.hands,
                    playerDiscordUserIds: game.playerDiscordUserIds,
                    discardCardNumbers: game.discardCardNumbers,
                },
                { topic, playerDiscordUserId: newPlayerId },
            );

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id,
                {
                    playerDiscordUserIds: [existingPlayerId, newPlayerId],
                    discardCardNumbers: [],
                    hands: [
                        {
                            topic,
                            playerDiscordUserId: newPlayerId,
                            isCompleted: false,
                            past: [],
                            present: [],
                            future: [],
                        },
                    ],
                },
            );
        });

        it('discards all cards from the current hand and appends a new hand when a prior hand exists', async () =>
        {
            // Arrange
            const pastCard = createPtuOracleCardDrawData({ cardNumber: 1 });
            const presentCard = createPtuOracleCardDrawData({ cardNumber: 2 });
            const futureCard = createPtuOracleCardDrawData({ cardNumber: 3 });
            const currentHand = createPtuOraclePlayerHandData({
                past: [pastCard],
                present: [presentCard],
                future: [futureCard],
            });
            const newPlayerId = 'newPlayer';
            const topic = 'What is life?';
            const game = createPtuOracleGameCollectionData({
                hands: [currentHand],
                discardCardNumbers: [10],
            });
            updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

            // Act
            await OracleHandManagerService.createNewHand(
                {
                    id: game.id,
                    hands: game.hands,
                    playerDiscordUserIds: game.playerDiscordUserIds,
                    discardCardNumbers: game.discardCardNumbers,
                },
                { topic, playerDiscordUserId: newPlayerId },
            );

            // Assert
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id,
                expect.objectContaining({
                    discardCardNumbers: expect.arrayContaining([
                        ...game.discardCardNumbers,
                        pastCard.cardNumber,
                        presentCard.cardNumber,
                        futureCard.cardNumber,
                    ]),
                    hands: [
                        currentHand,
                        {
                            topic,
                            playerDiscordUserId: newPlayerId,
                            isCompleted: false,
                            past: [],
                            present: [],
                            future: [],
                        },
                    ],
                }),
            );
        });

        it('de-duplicates playerDiscordUserIds when the new player is already in the set', async () =>
        {
            // Arrange
            const existingPlayerId = 'existingPlayer';
            const topic = 'What is life?';
            const game = createPtuOracleGameCollectionData({
                hands: [],
                playerDiscordUserIds: [existingPlayerId],
            });
            updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

            // Act
            await OracleHandManagerService.createNewHand(
                {
                    id: game.id,
                    hands: game.hands,
                    playerDiscordUserIds: game.playerDiscordUserIds,
                    discardCardNumbers: game.discardCardNumbers,
                },
                { topic, playerDiscordUserId: existingPlayerId },
            );

            // Assert
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id.toString(),
                expect.objectContaining({
                    playerDiscordUserIds: [existingPlayerId],
                    hands: expect.arrayContaining([
                        expect.objectContaining({ playerDiscordUserId: existingPlayerId }),
                    ]),
                }),
            );
        });
    });

    describe(`method: ${OracleHandManagerService.dealCardsForCurrentHand.name}`, () =>
    {
        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });
            getCardsMock.mockResolvedValue([createPtuOracleCardCollectionData()]);

            // Act & Assert
            await expect(
                OracleHandManagerService.dealCardsForCurrentHand({
                    id: game.id,
                    deckCardNumbers: game.deckCardNumbers,
                    hands: game.hands,
                }),
            ).rejects.toThrow('Current hand not found');
        });

        it.each(allGameTimes)('throws when the current (%s) hand is not empty', async (time) =>
        {
            // Arrange
            const hand = createPtuOraclePlayerHandData({
                [time]: [createPtuOracleCardDrawData()],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });
            getCardsMock.mockResolvedValue([createPtuOracleCardCollectionData()]);

            // Act & Assert
            await expect(
                OracleHandManagerService.dealCardsForCurrentHand({
                    id: game.id,
                    deckCardNumbers: game.deckCardNumbers,
                    hands: game.hands,
                }),
            ).rejects.toThrow('Cannot deal cards for a hand that is not empty');
        });

        // Three-card deck; rolls = [pastCardRoll, pastFaceRoll, presentCardRoll, presentFaceRoll, futureCardRoll, futureFaceRoll]
        // After each splice the array shrinks, so subsequent rolls index into the remaining cards.
        const deckCard1 = createPtuOracleCardCollectionData({ cardNumber: 1 });
        const deckCard2 = createPtuOracleCardCollectionData({ cardNumber: 2 });
        const deckCard3 = createPtuOracleCardCollectionData({ cardNumber: 3 });

        it.each([
            {
                rolls: [1, 1, 1, 1, 1, 1],
                expectedPast: { card: deckCard1, face: PtuOracleCardProphecyFace.Normal },
                expectedPresent: { card: deckCard2, face: PtuOracleCardProphecyFace.Normal },
                expectedFuture: { card: deckCard3, face: PtuOracleCardProphecyFace.Normal },
                existingHands: [],
                numOfExistingHands: 0,
            },
            {
                rolls: [3, 2, 2, 2, 1, 2],
                expectedPast: { card: deckCard3, face: PtuOracleCardProphecyFace.Reverse },
                expectedPresent: { card: deckCard2, face: PtuOracleCardProphecyFace.Reverse },
                expectedFuture: { card: deckCard1, face: PtuOracleCardProphecyFace.Reverse },
                existingHands: [],
                numOfExistingHands: 0,
            },
            {
                rolls: [2, 1, 1, 2, 1, 1],
                expectedPast: { card: deckCard2, face: PtuOracleCardProphecyFace.Normal },
                expectedPresent: { card: deckCard1, face: PtuOracleCardProphecyFace.Reverse },
                expectedFuture: { card: deckCard3, face: PtuOracleCardProphecyFace.Normal },
                existingHands: [],
                numOfExistingHands: 0,
            },
            {
                rolls: [1, 1, 1, 1, 1, 1],
                expectedPast: { card: deckCard1, face: PtuOracleCardProphecyFace.Normal },
                expectedPresent: { card: deckCard2, face: PtuOracleCardProphecyFace.Normal },
                expectedFuture: { card: deckCard3, face: PtuOracleCardProphecyFace.Normal },
                existingHands: getExistingHands(),
                numOfExistingHands: 2,
            },
        ])(
            'deals cards to past/present/future with rolls $rolls & existingHands.length = $numOfExistingHands',
            async ({
                rolls,
                expectedPast,
                expectedPresent,
                expectedFuture,
                existingHands,
            }) =>
            {
                // Arrange
                const hand = createPtuOraclePlayerHandData();
                const game = createPtuOracleGameCollectionData({
                    hands: [...existingHands, hand],
                    deckCardNumbers: [1, 2, 3],
                });
                getCardsMock.mockResolvedValue([deckCard1, deckCard2, deckCard3]);
                updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

                const buildExpectedDraw = ({ card, face }: { card: typeof deckCard1; face: PtuOracleCardProphecyFace }): {
                    action: PtuOracleCardAction;
                    cardNumber: number;
                    face: PtuOracleCardProphecyFace;
                    prophecy: string;
                } =>
                    ({
                        action: PtuOracleCardAction.FaceDown,
                        cardNumber: card.cardNumber,
                        face,
                        prophecy: face === PtuOracleCardProphecyFace.Normal
                            ? card.defaultProphecy
                            : card.defaultReverseProphecy,
                    });
                rolls.forEach(roll => mockRoll.mockReturnValueOnce([roll]));

                // Act
                await OracleHandManagerService.dealCardsForCurrentHand({
                    id: game.id,
                    deckCardNumbers: game.deckCardNumbers,
                    hands: game.hands,
                });

                // Assert
                expect(updateGameMock).toHaveBeenCalledWith(
                    game.id,
                    expect.objectContaining({
                        deckCardNumbers: [],
                        hands: [
                            ...existingHands,
                            expect.objectContaining({
                                past: [buildExpectedDraw(expectedPast)],
                                present: [buildExpectedDraw(expectedPresent)],
                                future: [buildExpectedDraw(expectedFuture)],
                            }),
                        ],
                    }),
                );
            },
        );
    });

    describe(`method: ${OracleHandManagerService.dealSingleCardForCurrentHand.name}`, () =>
    {
        describe.each(allGameTimes)('%s', (time) =>
        {
            it('throws when no current hand is found', async () =>
            {
                // Arrange
                const game = createPtuOracleGameCollectionData({ hands: [] });
                getCardsMock.mockResolvedValue([createPtuOracleCardCollectionData()]);

                // Act & Assert
                await expect(
                    OracleHandManagerService.dealSingleCardForCurrentHand({
                        id: game.id,
                        deckCardNumbers: game.deckCardNumbers,
                        hands: game.hands,
                    }, time),
                ).rejects.toThrow('Current hand not found');
            });

            it('throws when the current hand is not empty', async () =>
            {
                // Arrange
                const hand = createPtuOraclePlayerHandData({
                    [time]: [createPtuOracleCardDrawData()],
                });
                const game = createPtuOracleGameCollectionData({ hands: [hand] });
                getCardsMock.mockResolvedValue([createPtuOracleCardCollectionData()]);

                // Act & Assert
                await expect(
                    OracleHandManagerService.dealSingleCardForCurrentHand({
                        id: game.id,
                        deckCardNumbers: game.deckCardNumbers,
                        hands: game.hands,
                    }, time),
                ).rejects.toThrow('Cannot deal cards for a hand that is not empty');
            });

            // Three-card deck; rolls = [pastCardRoll, pastFaceRoll, presentCardRoll, presentFaceRoll, futureCardRoll, futureFaceRoll]
            // After each splice the array shrinks, so subsequent rolls index into the remaining cards.
            const deckCard1 = createPtuOracleCardCollectionData({ cardNumber: 1 });
            const deckCard2 = createPtuOracleCardCollectionData({ cardNumber: 2 });
            const deckCard3 = createPtuOracleCardCollectionData({ cardNumber: 3 });

            it.each([
                {
                    rolls: [1, 1],
                    expected: { card: deckCard1, face: PtuOracleCardProphecyFace.Normal },
                    existingHands: [],
                    numOfExistingHands: 0,
                },
                {
                    rolls: [3, 2],
                    expected: { card: deckCard3, face: PtuOracleCardProphecyFace.Reverse },
                    existingHands: [],
                    numOfExistingHands: 0,
                },
                {
                    rolls: [2, 1],
                    expected: { card: deckCard2, face: PtuOracleCardProphecyFace.Normal },
                    existingHands: [],
                    numOfExistingHands: 0,
                },
                {
                    rolls: [1, 1],
                    expected: { card: deckCard1, face: PtuOracleCardProphecyFace.Normal },
                    existingHands: getExistingHands(),
                    numOfExistingHands: 2,
                },
            ])(
                `deals cards to ${time} with rolls $rolls & numOfExistingHands $numOfExistingHands`,
                async ({
                    rolls,
                    expected,
                    existingHands,
                }) =>
                {
                    // Arrange
                    const hand = createPtuOraclePlayerHandData();
                    const game = createPtuOracleGameCollectionData({
                        hands: [...existingHands, hand],
                        deckCardNumbers: [1, 2, 3],
                    });
                    getCardsMock.mockResolvedValue([deckCard1, deckCard2, deckCard3]);
                    updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

                    const buildExpectedDraw = ({ card, face }: { card: typeof deckCard1; face: PtuOracleCardProphecyFace }): {
                        action: PtuOracleCardAction;
                        cardNumber: number;
                        face: PtuOracleCardProphecyFace;
                        prophecy: string;
                    } =>
                        ({
                            action: PtuOracleCardAction.FaceDown,
                            cardNumber: card.cardNumber,
                            face,
                            prophecy: face === PtuOracleCardProphecyFace.Normal
                                ? card.defaultProphecy
                                : card.defaultReverseProphecy,
                        });
                    rolls.forEach(roll => mockRoll.mockReturnValueOnce([roll]));

                    // Act
                    await OracleHandManagerService.dealSingleCardForCurrentHand({
                        id: game.id,
                        deckCardNumbers: game.deckCardNumbers,
                        hands: game.hands,
                    }, time);

                    // Assert
                    expect(updateGameMock).toHaveBeenCalledWith(
                        game.id,
                        expect.objectContaining({
                            deckCardNumbers: game.deckCardNumbers.filter(cardNumber => cardNumber !== expected.card.cardNumber),
                            hands: [
                                ...existingHands,
                                expect.objectContaining({
                                    past: [],
                                    present: [],
                                    future: [],
                                    [time]: [buildExpectedDraw(expected)],
                                }),
                            ],
                        }),
                    );
                },
            );
        });
    });

    describe(`method: ${OracleHandManagerService.acceptFate.name}`, () =>
    {
        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });

            // Act & Assert
            await expect(
                OracleHandManagerService.acceptFate({ id: game.id, hands: game.hands }),
            ).rejects.toThrow('Current hand not found');
        });

        it('throws when the last card in the time period is not face up', async () =>
        {
            // Arrange — past has a FaceUp card followed by a FaceDown card (last card is FaceDown)
            const hand = createPtuOraclePlayerHandData({
                past: [
                    createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp }),
                    createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceDown }),
                ],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });

            // Act & Assert
            await expect(
                OracleHandManagerService.acceptFate({ id: game.id, hands: game.hands }),
            ).rejects.toThrow('Card is not face up');
        });

        it.each([
            ...allGameTimes.map(time => ({
                time, existingHands: [], numOfExistingHands: 0,
            })),
            ...allGameTimes.map(time => ({
                time, existingHands: getExistingHands(), numOfExistingHands: 2,
            })),
        ])(
            'updates the $time FaceUp card to Accepted with numOfExistingHands = $numOfExistingHands',
            async ({ time, existingHands }) =>
            {
                // Arrange
                const faceUpCard = createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp });
                const hand = createPtuOraclePlayerHandData({
                    past: time === PtuOracleGameTime.Past ? [faceUpCard] : [],
                    present: time === PtuOracleGameTime.Present ? [faceUpCard] : [],
                    future: time === PtuOracleGameTime.Future ? [faceUpCard] : [],
                });
                const game = createPtuOracleGameCollectionData({ hands: [...existingHands, hand] });
                const expectedResult = createPtuOracleGameCollectionData();
                updateGameMock.mockResolvedValue(expectedResult);

                // Act
                const result = await OracleHandManagerService.acceptFate({ id: game.id, hands: game.hands });

                // Assert
                expect(result).toEqual(expectedResult);
                expect(updateGameMock).toHaveBeenCalledWith(
                    game.id,
                    expect.objectContaining({
                        hands: [
                            ...existingHands,
                            expect.objectContaining({
                                [time]: [{ ...faceUpCard, action: PtuOracleCardAction.Accepted }],
                            }),
                        ],
                    }),
                );
            },
        );
    });

    describe(`method: ${OracleHandManagerService.denyFate.name}`, () =>
    {
        const denyDeckCards = [
            createPtuOracleCardCollectionData({ cardNumber: 10 }),
            createPtuOracleCardCollectionData({ cardNumber: 20 }),
            createPtuOracleCardCollectionData({ cardNumber: 30 }),
        ];

        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });
            getCardsMock.mockResolvedValue(denyDeckCards);

            // Act & Assert
            await expect(
                OracleHandManagerService.denyFate({
                    id: game.id,
                    deckCardNumbers: game.deckCardNumbers,
                    discardCardNumbers: game.discardCardNumbers,
                    hands: game.hands,
                }),
            ).rejects.toThrow('Current hand not found');
        });

        it('throws when the last card in the time period is not face up', async () =>
        {
            // Arrange — past has FaceUp then FaceDown (last card is FaceDown)
            const hand = createPtuOraclePlayerHandData({
                past: [
                    createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp }),
                    createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceDown }),
                ],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });
            getCardsMock.mockResolvedValue(denyDeckCards);
            mockRoll.mockReturnValueOnce([1]).mockReturnValueOnce([1]);

            // Act & Assert
            await expect(
                OracleHandManagerService.denyFate({
                    id: game.id,
                    deckCardNumbers: game.deckCardNumbers,
                    discardCardNumbers: game.discardCardNumbers,
                    hands: game.hands,
                }),
            ).rejects.toThrow('Card is not face up');
        });

        const cases = [
            {
                cardRoll: 1, faceRoll: 1, expectedCardIndex: 0, expectedFace: PtuOracleCardProphecyFace.Normal,
            },
            {
                cardRoll: 3, faceRoll: 2, expectedCardIndex: 2, expectedFace: PtuOracleCardProphecyFace.Reverse,
            },
            {
                cardRoll: 2, faceRoll: 1, expectedCardIndex: 1, expectedFace: PtuOracleCardProphecyFace.Normal,
            },
            {
                cardRoll: 2, faceRoll: 2, expectedCardIndex: 1, expectedFace: PtuOracleCardProphecyFace.Reverse,
            },
        ];
        it.each([
            ...cases.map(args => ({
                ...args, existingHands: [], numOfExistingHands: 0,
            })),
            ...cases.map(args => ({
                ...args, existingHands: getExistingHands(), numOfExistingHands: 2,
            })),
        ])(
            'marks current card as Denied and draws replacement at roll $cardRoll with $expectedFace face & numOfExistingHands = $numOfExistingHands',
            async ({
                cardRoll,
                faceRoll,
                expectedCardIndex,
                expectedFace,
                existingHands,
            }) =>
            {
                // Arrange
                const faceUpCard = createPtuOracleCardDrawData({ cardNumber: 99, action: PtuOracleCardAction.FaceUp });
                const hand = createPtuOraclePlayerHandData({ past: [faceUpCard] });
                const game = createPtuOracleGameCollectionData({
                    hands: [...existingHands, hand],
                    deckCardNumbers: [10, 20, 30],
                    discardCardNumbers: [],
                });
                updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

                const drawnCard = denyDeckCards[expectedCardIndex];
                const expectedDeckCardNumbers = denyDeckCards
                    .reduce<number[]>((acc, c) =>
                    {
                        if (c.cardNumber !== drawnCard.cardNumber)
                        {
                            acc.push(c.cardNumber);
                        }
                        return acc;
                    }, []);

                getCardsMock.mockResolvedValue(denyDeckCards);
                mockRoll.mockReturnValueOnce([cardRoll]).mockReturnValueOnce([faceRoll]);

                // Act
                await OracleHandManagerService.denyFate({
                    id: game.id,
                    deckCardNumbers: game.deckCardNumbers,
                    discardCardNumbers: game.discardCardNumbers,
                    hands: game.hands,
                });

                // Assert
                expect(updateGameMock).toHaveBeenCalledWith(
                    game.id,
                    expect.objectContaining({
                        deckCardNumbers: expectedDeckCardNumbers,
                        discardCardNumbers: [faceUpCard.cardNumber],
                        hands: [
                            ...existingHands,
                            expect.objectContaining({
                                past: [
                                    { ...faceUpCard, action: PtuOracleCardAction.Denied },
                                    {
                                        action: PtuOracleCardAction.FaceDown,
                                        cardNumber: drawnCard.cardNumber,
                                        face: expectedFace,
                                        prophecy: expectedFace === PtuOracleCardProphecyFace.Normal
                                            ? drawnCard.defaultProphecy
                                            : drawnCard.defaultReverseProphecy,
                                    },
                                ],
                            }),
                        ],
                    }),
                );
            },
        );
    });

    describe(`method: ${OracleHandManagerService.questionFate.name}`, () =>
    {
        const questionDeckCards = [
            createPtuOracleCardCollectionData({ cardNumber: 10 }),
            createPtuOracleCardCollectionData({ cardNumber: 20 }),
            createPtuOracleCardCollectionData({ cardNumber: 30 }),
        ];

        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });
            getCardsMock.mockResolvedValue(questionDeckCards);

            // Act & Assert
            await expect(
                OracleHandManagerService.questionFate(
                    {
                        id: game.id, deckCardNumbers: game.deckCardNumbers, hands: game.hands,
                    },
                    'What is my fate?',
                ),
            ).rejects.toThrow('Current hand not found');
        });

        const cases = [
            {
                cardRoll: 1, faceRoll: 1, expectedCardIndex: 0, expectedFace: PtuOracleCardProphecyFace.Normal,
            },
            {
                cardRoll: 3, faceRoll: 2, expectedCardIndex: 2, expectedFace: PtuOracleCardProphecyFace.Reverse,
            },
            {
                cardRoll: 2, faceRoll: 1, expectedCardIndex: 1, expectedFace: PtuOracleCardProphecyFace.Normal,
            },
            {
                cardRoll: 2, faceRoll: 2, expectedCardIndex: 1, expectedFace: PtuOracleCardProphecyFace.Reverse,
            },
        ];
        it.each([
            ...cases.map(args => ({
                ...args, existingHands: [], numOfExistingHands: 0,
            })),
            ...cases.map(args => ({
                ...args, existingHands: getExistingHands(), numOfExistingHands: 2,
            })),
        ])(
            'marks current FaceUp card as Questioned and draws new FaceDown card at roll $cardRoll with $expectedFace face & numOfExistingHands = $numOfExistingHands',
            async ({
                cardRoll,
                faceRoll,
                expectedCardIndex,
                expectedFace,
                existingHands,
            }) =>
            {
                // Arrange
                const question = 'What is my fate?';
                const faceUpCard = createPtuOracleCardDrawData({ cardNumber: 99, action: PtuOracleCardAction.FaceUp });
                const hand = createPtuOraclePlayerHandData({ past: [faceUpCard] });
                const game = createPtuOracleGameCollectionData({
                    hands: [...existingHands, hand],
                    deckCardNumbers: [10, 20, 30],
                });
                updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

                const drawnCard = questionDeckCards[expectedCardIndex];

                getCardsMock.mockResolvedValue(questionDeckCards);
                mockRoll.mockReturnValueOnce([cardRoll]).mockReturnValueOnce([faceRoll]);

                // Act
                await OracleHandManagerService.questionFate(
                    {
                        id: game.id, deckCardNumbers: game.deckCardNumbers, hands: game.hands,
                    },
                    question,
                );

                // Assert
                expect(updateGameMock).toHaveBeenCalledWith(
                    game.id,
                    expect.objectContaining({
                        hands: [
                            ...existingHands,
                            expect.objectContaining({
                                past: [
                                    {
                                        ...faceUpCard,
                                        action: PtuOracleCardAction.Questioned,
                                        playerQuestion: question,
                                    },
                                    {
                                        action: PtuOracleCardAction.FaceDown,
                                        cardNumber: drawnCard.cardNumber,
                                        face: expectedFace,
                                        prophecy: expectedFace === PtuOracleCardProphecyFace.Normal
                                            ? drawnCard.defaultProphecy
                                            : drawnCard.defaultReverseProphecy,
                                    },
                                ],
                            }),
                        ],
                    }),
                );
            },
        );
    });

    describe(`method: ${OracleHandManagerService.revealFullProphecy.name}`, () =>
    {
        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });

            // Act & Assert
            await expect(
                OracleHandManagerService.revealFullProphecy({ id: game.id, hands: game.hands }),
            ).rejects.toThrow('Current hand not found');
        });

        it.each([
            { existingHands: [], numOfExistingHands: 0 },
            { existingHands: getExistingHands(), numOfExistingHands: 2 },
        ])('sets isCompleted to true on the current hand with numOfExistingHands = $numOfExistingHands', async ({ existingHands }) =>
        {
            // Arrange
            const hand = createPtuOraclePlayerHandData({ isCompleted: false });
            const game = createPtuOracleGameCollectionData({ hands: [...existingHands, hand] });
            const expectedResult = createPtuOracleGameCollectionData();
            updateGameMock.mockResolvedValue(expectedResult);

            // Act
            const result = await OracleHandManagerService.revealFullProphecy({ id: game.id, hands: game.hands });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id,
                expect.objectContaining({
                    hands: [...existingHands, expect.objectContaining({ isCompleted: true })],
                }),
            );
        });
    });

    describe(`method: ${OracleHandManagerService.revealNextCard.name}`, () =>
    {
        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });

            // Act & Assert
            await expect(
                OracleHandManagerService.revealNextCard({ id: game.id, hands: game.hands }),
            ).rejects.toThrow('Current hand not found');
        });

        it('throws when no FaceDown card exists in any time period', async () =>
        {
            // Arrange
            const hand = createPtuOraclePlayerHandData({
                past: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp })],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });

            // Act & Assert
            await expect(
                OracleHandManagerService.revealNextCard({ id: game.id, hands: game.hands }),
            ).rejects.toThrow('Cannot get time from hand with no face down cards');
        });

        it.each([
            ...allGameTimes.map((time) => [time, 0, []]),
            ...allGameTimes.map((time) => [time, 2, getExistingHands()]),
        ])(
            'reveals the %s FaceDown card to FaceUp with %s existing hands',
            async (time, _, existingHands) =>
            {
                // Arrange
                const faceDownCard = createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceDown });
                const hand = createPtuOraclePlayerHandData({
                    past: time === PtuOracleGameTime.Past ? [faceDownCard] : [],
                    present: time === PtuOracleGameTime.Present ? [faceDownCard] : [],
                    future: time === PtuOracleGameTime.Future ? [faceDownCard] : [],
                });
                const game = createPtuOracleGameCollectionData({ hands: [...existingHands, hand] });
                updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

                // Act
                await OracleHandManagerService.revealNextCard({ id: game.id, hands: game.hands });

                // Assert
                expect(updateGameMock).toHaveBeenCalledWith(
                    game.id,
                    expect.objectContaining({
                        hands: [
                            ...existingHands,
                            expect.objectContaining({
                                [time]: [{ ...faceDownCard, action: PtuOracleCardAction.FaceUp }],
                            }),
                        ],
                    }),
                );
            },
        );
    });

    describe(`method: ${OracleHandManagerService.rerollCard.name}`, () =>
    {
        const rerollDeckCards = [
            createPtuOracleCardCollectionData({ cardNumber: 10 }),
            createPtuOracleCardCollectionData({ cardNumber: 20 }),
            createPtuOracleCardCollectionData({ cardNumber: 30 }),
        ];

        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });
            getCardsMock.mockResolvedValue(rerollDeckCards);

            // Act & Assert
            await expect(
                OracleHandManagerService.rerollCard(
                    {
                        id: game.id, deckCardNumbers: game.deckCardNumbers, hands: game.hands,
                    },
                    PtuOracleGameTime.Past,
                ),
            ).rejects.toThrow('Current hand not found');
        });

        it('throws when the time period has no cards', async () =>
        {
            // Arrange
            const hand = createPtuOraclePlayerHandData({ past: [] });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });
            getCardsMock.mockResolvedValue(rerollDeckCards);
            mockRoll.mockReturnValueOnce([1]).mockReturnValueOnce([1]);

            // Act & Assert
            await expect(
                OracleHandManagerService.rerollCard(
                    {
                        id: game.id, deckCardNumbers: game.deckCardNumbers, hands: game.hands,
                    },
                    PtuOracleGameTime.Past,
                ),
            ).rejects.toThrow('Current card not found');
        });

        it('throws when the last card in the time period is not face down', async () =>
        {
            // Arrange
            const hand = createPtuOraclePlayerHandData({
                past: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp })],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });
            getCardsMock.mockResolvedValue(rerollDeckCards);
            mockRoll.mockReturnValueOnce([1]).mockReturnValueOnce([1]);

            // Act & Assert
            await expect(
                OracleHandManagerService.rerollCard(
                    {
                        id: game.id, deckCardNumbers: game.deckCardNumbers, hands: game.hands,
                    },
                    PtuOracleGameTime.Past,
                ),
            ).rejects.toThrow('Card is not face down');
        });

        const cases = [
            {
                cardRoll: 1, faceRoll: 1, expectedCardIndex: 0, expectedFace: PtuOracleCardProphecyFace.Normal, time: PtuOracleGameTime.Past,
            },
            {
                cardRoll: 3, faceRoll: 2, expectedCardIndex: 2, expectedFace: PtuOracleCardProphecyFace.Reverse, time: PtuOracleGameTime.Past,
            },
            {
                cardRoll: 2, faceRoll: 1, expectedCardIndex: 1, expectedFace: PtuOracleCardProphecyFace.Normal, time: PtuOracleGameTime.Present,
            },
            {
                cardRoll: 2, faceRoll: 2, expectedCardIndex: 1, expectedFace: PtuOracleCardProphecyFace.Reverse, time: PtuOracleGameTime.Present,
            },
            {
                cardRoll: 1, faceRoll: 2, expectedCardIndex: 0, expectedFace: PtuOracleCardProphecyFace.Reverse, time: PtuOracleGameTime.Future,
            },
            {
                cardRoll: 3, faceRoll: 1, expectedCardIndex: 2, expectedFace: PtuOracleCardProphecyFace.Normal, time: PtuOracleGameTime.Future,
            },
        ];
        it.each([
            ...cases.map(args => ({
                ...args, existingHands: [], numOfExistingHands: 0,
            })),
            ...cases.map(args => ({
                ...args, existingHands: getExistingHands(), numOfExistingHands: 2,
            })),
        ])(
            'rerolls the $time card at roll $cardRoll with $expectedFace face and returns old card to deck with $numOfExistingHands existing hands',
            async ({
                cardRoll,
                faceRoll,
                expectedCardIndex,
                expectedFace,
                time,
                existingHands,
            }) =>
            {
                // Arrange
                const oldCard = createPtuOracleCardDrawData({ cardNumber: 99, action: PtuOracleCardAction.FaceDown });
                const hand = createPtuOraclePlayerHandData({
                    past: time === PtuOracleGameTime.Past ? [oldCard] : [],
                    present: time === PtuOracleGameTime.Present ? [oldCard] : [],
                    future: time === PtuOracleGameTime.Future ? [oldCard] : [],
                });
                const game = createPtuOracleGameCollectionData({
                    hands: [...existingHands, hand],
                    deckCardNumbers: [10, 20, 30],
                });
                getCardsMock.mockResolvedValue(rerollDeckCards);
                updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

                const drawnCard = rerollDeckCards[expectedCardIndex];
                const expectedDeckCardNumbers = rerollDeckCards
                    .reduce<number[]>((acc, c) =>
                    {
                        if (c.cardNumber !== drawnCard.cardNumber)
                        {
                            acc.push(c.cardNumber);
                        }
                        return acc;
                    }, [oldCard.cardNumber])
                    .sort((a, b) => a - b);
                mockRoll.mockReturnValueOnce([cardRoll]).mockReturnValueOnce([faceRoll]);

                // Act
                await OracleHandManagerService.rerollCard(
                    {
                        id: game.id, deckCardNumbers: game.deckCardNumbers, hands: game.hands,
                    },
                    time,
                );

                // Assert
                expect(updateGameMock).toHaveBeenCalledWith(
                    game.id,
                    expect.objectContaining({
                        deckCardNumbers: expectedDeckCardNumbers,
                        hands: [
                            ...existingHands,
                            expect.objectContaining({
                                [time]: [
                                    {
                                        action: PtuOracleCardAction.FaceDown,
                                        cardNumber: drawnCard.cardNumber,
                                        face: expectedFace,
                                        prophecy: expectedFace === PtuOracleCardProphecyFace.Normal
                                            ? drawnCard.defaultProphecy
                                            : drawnCard.defaultReverseProphecy,
                                    },
                                ],
                            }),
                        ],
                    }),
                );
            },
        );
    });

    describe(`method: ${OracleHandManagerService.editCurrentHandsProphecies.name}`, () =>
    {
        it('throws when no current hand is found', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });

            // Act & Assert
            await expect(
                OracleHandManagerService.editCurrentHandsProphecies(
                    { id: game.id, hands: game.hands },
                    {
                        past: 'p', present: 'p', future: 'p', questioned: undefined, denied: undefined,
                    },
                ),
            ).rejects.toThrow('Current hand not found');
        });

        it.each([
            { existingHands: [], numOfExistingHands: 0 },
            { existingHands: getExistingHands(), numOfExistingHands: 2 },
        ])('updates prophecies for past, present, and future cards with $numOfExistingHands existing hands', async ({ existingHands }) =>
        {
            // Arrange
            const pastCard = createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp });
            const presentCard = createPtuOracleCardDrawData({ action: PtuOracleCardAction.Accepted });
            const futureCard = createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceDown });
            const hand = createPtuOraclePlayerHandData({
                past: [pastCard],
                present: [presentCard],
                future: [futureCard],
            });
            const game = createPtuOracleGameCollectionData({ hands: [...existingHands, hand] });
            const prophecies = {
                past: 'new past prophecy',
                present: 'new present prophecy',
                future: 'new future prophecy',
                questioned: undefined,
                denied: undefined,
            };
            updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

            // Act
            await OracleHandManagerService.editCurrentHandsProphecies(
                { id: game.id, hands: game.hands },
                prophecies,
            );

            // Assert
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id,
                expect.objectContaining({
                    hands: [
                        ...existingHands,
                        expect.objectContaining({
                            past: [{ ...pastCard, prophecy: prophecies.past }],
                            present: [{ ...presentCard, prophecy: prophecies.present }],
                            future: [{ ...futureCard, prophecy: prophecies.future }],
                        }),
                    ],
                }),
            );
        });

        it('uses the denied prophecy for Denied cards when provided', async () =>
        {
            // Arrange
            const deniedCard = createPtuOracleCardDrawData({ action: PtuOracleCardAction.Denied });
            const hand = createPtuOraclePlayerHandData({
                past: [deniedCard],
                present: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp })],
                future: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceDown })],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });
            const prophecies = {
                past: 'past prophecy',
                present: 'present prophecy',
                future: 'future prophecy',
                questioned: undefined,
                denied: 'denied prophecy',
            };
            updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

            // Act
            await OracleHandManagerService.editCurrentHandsProphecies(
                { id: game.id, hands: game.hands },
                prophecies,
            );

            // Assert
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id,
                expect.objectContaining({
                    hands: [
                        expect.objectContaining({
                            past: [{ ...deniedCard, prophecy: prophecies.denied }],
                        }),
                    ],
                }),
            );
        });

        it('uses the questioned prophecy for Questioned cards when provided', async () =>
        {
            // Arrange
            const questionedCard = createPtuOracleCardDrawData({
                action: PtuOracleCardAction.Questioned,
                playerQuestion: 'What is my fate?',
            });
            const hand = createPtuOraclePlayerHandData({
                past: [questionedCard],
                present: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceUp })],
                future: [createPtuOracleCardDrawData({ action: PtuOracleCardAction.FaceDown })],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });
            const prophecies = {
                past: 'past prophecy',
                present: 'present prophecy',
                future: 'future prophecy',
                questioned: 'questioned prophecy',
                denied: undefined,
            };
            updateGameMock.mockResolvedValue(createPtuOracleGameCollectionData());

            // Act
            await OracleHandManagerService.editCurrentHandsProphecies(
                { id: game.id, hands: game.hands },
                prophecies,
            );

            // Assert
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id,
                expect.objectContaining({
                    hands: [
                        expect.objectContaining({
                            past: [{ ...questionedCard, prophecy: prophecies.questioned }],
                        }),
                    ],
                }),
            );
        });
    });

    describe(`method: ${OracleHandManagerService.getCurrentHand.name}`, () =>
    {
        it('returns undefined when there are no hands', () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });

            // Act
            const result = OracleHandManagerService.getCurrentHand({ hands: game.hands });

            // Assert
            expect(result).toBeUndefined();
        });

        it('returns the last hand in the array', () =>
        {
            // Arrange
            const priorHand = createPtuOraclePlayerHandData();
            const currentHand = createPtuOraclePlayerHandData();
            const game = createPtuOracleGameCollectionData({ hands: [priorHand, currentHand] });

            // Act
            const result = OracleHandManagerService.getCurrentHand({ hands: game.hands });

            // Assert
            expect(result).toEqual(currentHand);
        });
    });

    describe(`method: ${OracleHandManagerService.getCurrentHandDetailed.name}`, () =>
    {
        it('returns undefined when there are no hands', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ hands: [] });

            // Act
            const result = await OracleHandManagerService.getCurrentHandDetailed({ hands: game.hands });

            // Assert
            expect(result).toBeUndefined();
        });

        it('returns the current hand with card objects resolved by card number', async () =>
        {
            // Arrange
            const pastCardData = createPtuOracleCardCollectionData({ cardNumber: 1 });
            const presentCardData = createPtuOracleCardCollectionData({ cardNumber: 2 });
            const futureCardData = createPtuOracleCardCollectionData({ cardNumber: 3 });

            const pastDraw = createPtuOracleCardDrawData({ cardNumber: 1 });
            const presentDraw = createPtuOracleCardDrawData({ cardNumber: 2 });
            const futureDraw = createPtuOracleCardDrawData({ cardNumber: 3 });

            const hand = createPtuOraclePlayerHandData({
                past: [pastDraw],
                present: [presentDraw],
                future: [futureDraw],
            });
            const game = createPtuOracleGameCollectionData({ hands: [hand] });
            getCardsMock.mockResolvedValue([pastCardData, presentCardData, futureCardData]);

            // Act
            const result = await OracleHandManagerService.getCurrentHandDetailed({ hands: game.hands });

            // Assert
            expect(result).toEqual(
                expect.objectContaining({
                    past: [{ ...pastDraw, card: pastCardData }],
                    present: [{ ...presentDraw, card: presentCardData }],
                    future: [{ ...futureDraw, card: futureCardData }],
                }),
            );
        });
    });

    describe(`method: ${OracleHandManagerService.getHandsDetailed.name}`, () =>
    {
        it('returns all hands with card objects resolved by card number', async () =>
        {
            // Arrange
            const card1 = createPtuOracleCardCollectionData({ cardNumber: 1 });
            const card2 = createPtuOracleCardCollectionData({ cardNumber: 2 });

            const draw1 = createPtuOracleCardDrawData({ cardNumber: 1 });
            const draw2 = createPtuOracleCardDrawData({ cardNumber: 2 });

            const hand1 = createPtuOraclePlayerHandData({ past: [draw1] });
            const hand2 = createPtuOraclePlayerHandData({ present: [draw2] });

            const game = createPtuOracleGameCollectionData({ hands: [hand1, hand2] });
            getAllCardsMock.mockResolvedValue([card1, card2]);

            // Act
            const result = await OracleHandManagerService.getHandsDetailed({ hands: game.hands });

            // Assert
            expect(result).toEqual([
                expect.objectContaining({ past: [{ ...draw1, card: card1 }] }),
                expect.objectContaining({ present: [{ ...draw2, card: card2 }] }),
            ]);
        });

        it('returns empty array if hands are empty', async () =>
        {
            // Arrange
            const card1 = createPtuOracleCardCollectionData({ cardNumber: 1 });
            const card2 = createPtuOracleCardCollectionData({ cardNumber: 2 });

            const game = createPtuOracleGameCollectionData({ hands: [] });
            getAllCardsMock.mockResolvedValue([card1, card2]);

            // Act
            const result = await OracleHandManagerService.getHandsDetailed({ hands: game.hands });

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe(`method: ${OracleHandManagerService.updateGameStatus.name}`, () =>
    {
        it('calls updateGame with the new status', async () =>
        {
            // Arrange
            const game = createPtuOracleGameCollectionData({ status: PtuOracleGameStatus.Active });
            const expectedResult = createPtuOracleGameCollectionData();
            updateGameMock.mockResolvedValue(expectedResult);

            // Act
            const result = await OracleHandManagerService.updateGameStatus(
                { id: game.id },
                PtuOracleGameStatus.Complete,
            );

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateGameMock).toHaveBeenCalledWith(
                game.id,
                { status: PtuOracleGameStatus.Complete },
            );
        });
    });

    describe(`method: ${OracleHandManagerService['drawCards'].name}`, () =>
    {
        const allCards = bulkCreatePtuOracleCardCollectionData(53);

        it('draws the requested number of cards', () =>
        {
            // Arrange
            [6, 1, 4, 2, 2, 1].forEach(roll => mockRoll.mockReturnValueOnce([roll]));

            // Act
            const result = OracleHandManagerService['drawCards'](allCards, 3);

            // Assert
            expect(result.drawnCards.length).toEqual(3);
            expect(result.drawnCards).toEqual([
                {
                    card: allCards[5],
                    face: PtuOracleCardProphecyFace.Normal,
                },
                {
                    card: allCards[3],
                    face: PtuOracleCardProphecyFace.Reverse,
                },
                {
                    card: allCards[1],
                    face: PtuOracleCardProphecyFace.Normal,
                },
            ]);
        });

        it('returns the updated deck of card numbers', () =>
        {
            // Arrange
            [6, 1, 4, 2, 2, 1].forEach(roll => mockRoll.mockReturnValueOnce([roll]));

            // Act
            const result = OracleHandManagerService['drawCards'](allCards, 3);

            // Assert
            expect(result.updatedDeckCardNumbers.length).toEqual(allCards.length - 3);
            expect(result.updatedDeckCardNumbers).toEqual(
                allCards.reduce<number[]>((acc, cur, index) =>
                {
                    if (index !== 5 && index !== 3 && index !== 1)
                    {
                        acc.push(cur.cardNumber);
                    }
                    return acc;
                }, []),
            );
        });

        it('draws zero cards when no cards are requested', () =>
        {
            // Act
            const result = OracleHandManagerService['drawCards'](allCards, 0);

            // Assert
            expect(result.drawnCards.length).toEqual(0);
            expect(result.drawnCards).toEqual([]);
        });

        it('draws zero cards when negative cards are requested', () =>
        {
            // Act
            const result = OracleHandManagerService['drawCards'](allCards, -3);

            // Assert
            expect(result.drawnCards.length).toEqual(0);
            expect(result.drawnCards).toEqual([]);
        });

        it('does not modify input cards param', () =>
        {
            // Arrange
            [6, 1, 4, 2, 2, 1].forEach(roll => mockRoll.mockReturnValueOnce([roll]));
            const allCardsClone = [...allCards];

            // Act
            OracleHandManagerService['drawCards'](allCards, 3);

            // Assert
            expect(allCards).toEqual(allCardsClone);
        });
    });
});
