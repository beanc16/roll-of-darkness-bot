import { DiceLiteService } from '../../../../services/Dice/DiceLiteService.js';
import { PtuOracleCardCollection, PtuOracleCardProphecyFace } from '../../dal/models/PtuOracleCardCollection.js';
import {
    PtuOracleCardAction,
    PtuOracleCardDraw,
    PtuOracleGameCollection,
    PtuOracleGameStatus,
    PtuOracleGameTime,
    PtuOraclePlayerHand,
    PtuOraclePlayerHandDetailed,
} from '../../dal/models/PtuOracleGameCollection.js';
import { PtuOraclePseudoCache } from '../../dal/PtuOraclePseudoCache.js';

export class OracleHandManagerService
{
    public static async createNewHand(
        {
            id,
            hands,
            playerDiscordUserIds,
            discardCardNumbers,
        }: Pick<PtuOracleGameCollection, 'id' | 'hands' | 'playerDiscordUserIds' | 'discardCardNumbers'>, { topic, playerDiscordUserId }: {
            topic: string;
            playerDiscordUserId: string;
        }): Promise<PtuOracleGameCollection>
    {
        // Get data
        const { current: currentHand } = this.getCurrentAndPriorElementsFromArray(hands);
        const updatedDiscardCardNumbersSet = new Set(discardCardNumbers);

        // Set updated player ids
        const updatedPlayerDiscordUserIdsSet = new Set([...playerDiscordUserIds, playerDiscordUserId]);

        // Set updated discard card numbers if there's a current hand
        if (currentHand)
        {
            currentHand[PtuOracleGameTime.Past].forEach(card =>
                updatedDiscardCardNumbersSet.add(card.cardNumber),
            );
            currentHand[PtuOracleGameTime.Present].forEach(card =>
                updatedDiscardCardNumbersSet.add(card.cardNumber),
            );
            currentHand[PtuOracleGameTime.Future].forEach(card =>
                updatedDiscardCardNumbersSet.add(card.cardNumber),
            );
        }

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            // Update player ids and discard card numbers
            playerDiscordUserIds: [...updatedPlayerDiscordUserIdsSet],
            discardCardNumbers: [...updatedDiscardCardNumbersSet],
            // Keep prior hands and add a new hand
            hands: [
                ...hands,
                {
                    // Set topic
                    topic,
                    playerDiscordUserId,
                    isCompleted: false,
                    past: [],
                    present: [],
                    future: [],
                },
            ],
        });
    }

    public static async dealCardsForCurrentHand({
        id,
        deckCardNumbers,
        hands,
    }: Pick<PtuOracleGameCollection, 'id' | 'deckCardNumbers' | 'hands'>): Promise<PtuOracleGameCollection>
    {
        // Get data
        const cards = await PtuOraclePseudoCache.getCards({ including: deckCardNumbers });

        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        if (!(
            currentHand[PtuOracleGameTime.Past].length === 0
            && currentHand[PtuOracleGameTime.Present].length === 0
            && currentHand[PtuOracleGameTime.Future].length === 0
        ))
        {
            throw new Error('Cannot deal cards for a hand that is not empty');
        }

        // Draw cards
        const {
            drawnCards,
            updatedDeckCardNumbers,
            shouldResetDiscards,
        } = await this.drawCards(cards, 3);
        const [pastCard, presentCard, futureCard] = drawnCards;

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            deckCardNumbers: updatedDeckCardNumbers,
            ...(shouldResetDiscards ? { discardCardNumbers: [] } : {}),
            // Keep prior hands and add a new hand
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    past: [{
                        action: PtuOracleCardAction.FaceDown,
                        cardNumber: pastCard.card.cardNumber,
                        face: pastCard.face,
                        prophecy: this.getCardDefaultProphecy(pastCard.card, pastCard.face),
                    }],
                    present: [{
                        action: PtuOracleCardAction.FaceDown,
                        cardNumber: presentCard.card.cardNumber,
                        face: presentCard.face,
                        prophecy: this.getCardDefaultProphecy(presentCard.card, presentCard.face),
                    }],
                    future: [{
                        action: PtuOracleCardAction.FaceDown,
                        cardNumber: futureCard.card.cardNumber,
                        face: futureCard.face,
                        prophecy: this.getCardDefaultProphecy(futureCard.card, futureCard.face),
                    }],
                },
            ],
        });
    }

    public static async dealSingleCardForCurrentHand({
        id,
        deckCardNumbers,
        hands,
    }: Pick<PtuOracleGameCollection, 'id' | 'deckCardNumbers' | 'hands'>, time: PtuOracleGameTime): Promise<PtuOracleGameCollection>
    {
        // Get data
        const cards = await PtuOraclePseudoCache.getCards({ including: deckCardNumbers });

        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        if (!(
            currentHand[PtuOracleGameTime.Past].length === 0
            && currentHand[PtuOracleGameTime.Present].length === 0
            && currentHand[PtuOracleGameTime.Future].length === 0
        ))
        {
            throw new Error('Cannot deal cards for a hand that is not empty');
        }

        // Draw cards
        const {
            drawnCards: [drawnCard],
            updatedDeckCardNumbers,
            shouldResetDiscards,
        } = await this.drawCards(cards, 1);

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            deckCardNumbers: updatedDeckCardNumbers,
            ...(shouldResetDiscards ? { discardCardNumbers: [] } : {}),
            // Keep prior hands and add a new hand
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    past: [],
                    present: [],
                    future: [],
                    [time]: [{
                        action: PtuOracleCardAction.FaceDown,
                        cardNumber: drawnCard.card.cardNumber,
                        face: drawnCard.face,
                        prophecy: this.getCardDefaultProphecy(drawnCard.card, drawnCard.face),
                    }],
                },
            ],
        });
    }

    public static async acceptFate({ id, hands }: Pick<PtuOracleGameCollection, 'id' | 'hands'>): Promise<PtuOracleGameCollection>
    {
        // Get data
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        // Get current hand
        const { cards: handsTime, time } = this.getHandsTime(currentHand, PtuOracleCardAction.FaceUp);
        const { current: currentHandsTime, prior: priorHandsTime } = this.getCurrentAndPriorElementsFromArray(handsTime);

        // Throw error if card is not face down
        if (!currentHandsTime)
        {
            throw new Error('Current hand time not found');
        }
        if (currentHandsTime.action !== PtuOracleCardAction.FaceUp)
        {
            throw new Error('Card is not face up');
        }

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            // Keep prior hands and edit the current hand to have the
            // current past/present/future card be face up
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    [time]: [
                        ...priorHandsTime,
                        {
                            ...currentHandsTime,
                            action: PtuOracleCardAction.Accepted,
                        },
                    ],
                },
            ],
        });
    }

    public static async denyFate(
        {
            id,
            deckCardNumbers,
            discardCardNumbers,
            hands,
        }: Pick<PtuOracleGameCollection, 'id' | 'deckCardNumbers' | 'discardCardNumbers' | 'hands'>,
    ): Promise<PtuOracleGameCollection>
    {
        // Get data
        const cards = await PtuOraclePseudoCache.getCards({ including: deckCardNumbers });

        // Draw cards
        const {
            drawnCards: [drawnCard],
            updatedDeckCardNumbers,
            shouldResetDiscards,
        } = await this.drawCards(cards, 1);

        // Set update data
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        // Update current hand with new card
        const { cards: handsTime, time } = this.getHandsTime(currentHand, PtuOracleCardAction.FaceUp);
        const { current: currentHandsTime, prior: remainingCardsInHandsTime } = this.getCurrentAndPriorElementsFromArray(handsTime);

        if (!currentHandsTime)
        {
            throw new Error('Current card not found');
        }
        if (currentHandsTime.action !== PtuOracleCardAction.FaceUp)
        {
            throw new Error('Card is not face up');
        }

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            deckCardNumbers: updatedDeckCardNumbers,
            discardCardNumbers: [
                ...(shouldResetDiscards ? [] : discardCardNumbers),
                currentHandsTime.cardNumber,
            ],
            // Keep prior hands and edit the current hand to replace the
            // current past/present/future with the new card
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    [time]: [
                        ...remainingCardsInHandsTime,
                        {
                            ...currentHandsTime,
                            action: PtuOracleCardAction.Denied,
                        },
                        {
                            action: PtuOracleCardAction.FaceDown,
                            cardNumber: drawnCard.card.cardNumber,
                            face: drawnCard.face,
                            prophecy: this.getCardDefaultProphecy(drawnCard.card, drawnCard.face),
                        },
                    ],
                },
            ],
        });
    }

    public static async questionFate({
        id,
        deckCardNumbers,
        hands,
    }: Pick<PtuOracleGameCollection, 'id' | 'deckCardNumbers' | 'hands'>, question: string): Promise<PtuOracleGameCollection>
    {
        // Get data
        const cards = await PtuOraclePseudoCache.getCards({ including: deckCardNumbers });

        // Draw cards
        const {
            drawnCards: [drawnCard],
            updatedDeckCardNumbers,
            shouldResetDiscards,
        } = await this.drawCards(cards, 1);

        // Set update data
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        // Update current hand with new card
        const { cards: handsTime, time } = this.getHandsTime(currentHand, PtuOracleCardAction.FaceUp);

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            deckCardNumbers: updatedDeckCardNumbers,
            ...(shouldResetDiscards ? { discardCardNumbers: [] } : {}),
            // Keep prior hands and edit the current hand to add a
            // new past/present/future card
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    [time]: [
                        ...handsTime.map(card => ({
                            ...card,
                            action: card.action === PtuOracleCardAction.FaceUp
                                ? PtuOracleCardAction.Questioned
                                : card.action,
                            playerQuestion: question,
                        })),
                        {
                            action: PtuOracleCardAction.FaceDown,
                            cardNumber: drawnCard.card.cardNumber,
                            face: drawnCard.face,
                            prophecy: this.getCardDefaultProphecy(drawnCard.card, drawnCard.face),
                        },
                    ],
                },
            ],
        });
    }

    public static async revealFullProphecy({ id, hands }: Pick<PtuOracleGameCollection, 'id' | 'hands'>): Promise<PtuOracleGameCollection>
    {
        // Get data
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            // Keep prior hands and edit the current hand to have the
            // current past/present/future card be face up
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    isCompleted: true,
                },
            ],
        });
    }

    public static async revealNextCard({ id, hands }: Pick<PtuOracleGameCollection, 'id' | 'hands'>): Promise<PtuOracleGameCollection>
    {
        // Get data
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        // Update current hand with new card
        const { cards: handsTime, time } = this.getHandsTime(currentHand, PtuOracleCardAction.FaceDown);
        const { current: currentHandsTime, prior: remainingCardsInHandsTime } = this.getCurrentAndPriorElementsFromArray(handsTime);

        if (!currentHandsTime)
        {
            throw new Error('Current card not found');
        }

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            // Keep prior hands and edit the current hand to replace the
            // current past/present/future with the new card
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    [time]: [
                        ...remainingCardsInHandsTime,
                        {
                            ...currentHandsTime,
                            action: PtuOracleCardAction.FaceUp,
                        },
                    ],
                },
            ],
        });
    }

    public static async rerollCard(
        {
            id,
            deckCardNumbers,
            hands,
        }: Pick<PtuOracleGameCollection, 'id' | 'deckCardNumbers' | 'hands'>,
        time: PtuOracleGameTime,
    ): Promise<PtuOracleGameCollection>
    {
        // Get data
        const cards = await PtuOraclePseudoCache.getCards({ including: deckCardNumbers });

        // Draw cards
        const {
            drawnCards: [drawnCard],
            updatedDeckCardNumbers,
            shouldResetDiscards,
        } = await this.drawCards(cards, 1);
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        // Update current hand with new card
        const handsTime = currentHand[time];
        const { current: currentHandsTime, prior: remainingCardsInHandsTime } = this.getCurrentAndPriorElementsFromArray(handsTime);

        if (!currentHandsTime)
        {
            throw new Error('Current card not found');
        }
        if (currentHandsTime.action !== PtuOracleCardAction.FaceDown)
        {
            throw new Error('Card is not face down');
        }

        // Update cards
        updatedDeckCardNumbers.push(currentHandsTime.cardNumber);
        updatedDeckCardNumbers.sort((a, b) => a - b);

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            deckCardNumbers: updatedDeckCardNumbers,
            ...(shouldResetDiscards ? { discardCardNumbers: [] } : {}),
            // Keep prior hands and edit the current hand to replace the
            // current past/present/future with the rerolled card
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    [time]: [
                        ...remainingCardsInHandsTime,
                        {
                            action: PtuOracleCardAction.FaceDown,
                            cardNumber: drawnCard.card.cardNumber,
                            face: drawnCard.face,
                            prophecy: this.getCardDefaultProphecy(drawnCard.card, drawnCard.face),
                        },
                    ],
                },
            ],
        });
    }

    public static async replaceCard(
        {
            id,
            deckCardNumbers,
            hands,
        }: Pick<PtuOracleGameCollection, 'id' | 'deckCardNumbers' | 'hands'>,
        time: PtuOracleGameTime,
        deckCardToReplaceWith: {
            deckCardNumber: number;
            face: PtuOracleCardProphecyFace;
        },
    ): Promise<PtuOracleGameCollection>
    {
        // Get data
        const cardToReplaceWith = await PtuOraclePseudoCache.getCardByCardNumber(deckCardToReplaceWith.deckCardNumber);

        // Draw cards
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        // Update current hand with new card
        const handsTime = currentHand[time];
        const { current: currentHandsTime, prior: remainingCardsInHandsTime } = this.getCurrentAndPriorElementsFromArray(handsTime);

        if (!currentHandsTime)
        {
            throw new Error('Current card not found');
        }
        if (currentHandsTime.action !== PtuOracleCardAction.FaceDown)
        {
            throw new Error('Card is not face down');
        }

        const { cardNumber: previousCardNumber } = currentHandsTime;

        // Update cards
        const updatedDeckCardNumbers = deckCardNumbers.reduce<number[]>((acc, cur) =>
        {
            // Don't include the number to replace with
            if (cur !== deckCardToReplaceWith.deckCardNumber)
            {
                acc.push(cur);
            }
            return acc;
        }, previousCardNumber === deckCardToReplaceWith.deckCardNumber ? [] : [previousCardNumber]);
        updatedDeckCardNumbers.sort((a, b) => a - b);

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            deckCardNumbers: updatedDeckCardNumbers,
            // Keep prior hands and edit the current hand to replace the
            // current past/present/future with the rerolled card
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    [time]: [
                        ...remainingCardsInHandsTime,
                        {
                            action: PtuOracleCardAction.FaceDown,
                            cardNumber: cardToReplaceWith.cardNumber,
                            face: deckCardToReplaceWith.face,
                            prophecy: this.getCardDefaultProphecy(cardToReplaceWith, deckCardToReplaceWith.face),
                        },
                    ],
                },
            ],
        });
    }

    public static async editCurrentHandsProphecies(
        { id, hands }: Pick<PtuOracleGameCollection, 'id' | 'hands'>,
        prophecies: {
            past: string;
            present: string;
            future: string;
            questioned: string | undefined;
            denied: string | undefined;
        },
    ): Promise<PtuOracleGameCollection>
    {
        // Get data
        const { current: currentHand, prior: priorHands } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            throw new Error('Current hand not found');
        }

        const {
            past,
            present,
            future,
        } = currentHand;

        const setNewProphecy = (
            card: PtuOracleCardDraw,
            key: 'past' | 'present' | 'future',
        ): PtuOracleCardDraw =>
        {
            let newProphecy = prophecies[key];

            if (card.action === PtuOracleCardAction.Denied && prophecies.denied)
            {
                newProphecy = prophecies.denied;
            }
            else if (card.action === PtuOracleCardAction.Questioned && prophecies.questioned)
            {
                newProphecy = prophecies.questioned;
            }

            return {
                ...card,
                prophecy: newProphecy,
            };
        };

        // Set current hand values with new prophecies
        const updatedPast = past.map(card => setNewProphecy(card, 'past'));
        const updatedPresent = present.map(card => setNewProphecy(card, 'present'));
        const updatedFuture = future.map(card => setNewProphecy(card, 'future'));

        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            // Keep prior hands and edit the current hand to have the
            // current past/present/future card be face up
            hands: [
                ...priorHands,
                {
                    ...currentHand,
                    past: updatedPast,
                    present: updatedPresent,
                    future: updatedFuture,
                },
            ],
        });
    }

    public static getCurrentHand({ hands }: Pick<PtuOracleGameCollection, 'hands'>): PtuOraclePlayerHand | undefined
    {
        const { current: currentHand } = this.getCurrentAndPriorElementsFromArray(hands);
        return currentHand;
    }

    public static async getCurrentHandDetailed({ hands }: Pick<PtuOracleGameCollection, 'hands'>): Promise<PtuOraclePlayerHandDetailed | undefined>
    {
        const { current: currentHand } = this.getCurrentAndPriorElementsFromArray(hands);

        if (!currentHand)
        {
            return undefined;
        }

        const pastCardNumbers = currentHand[PtuOracleGameTime.Past].map(card => card.cardNumber) || [];
        const presentCardNumbers = currentHand[PtuOracleGameTime.Present].map(card => card.cardNumber) || [];
        const futureCardNumbers = currentHand[PtuOracleGameTime.Future].map(card => card.cardNumber) || [];

        const cards = await PtuOraclePseudoCache.getCards({
            including: [
                ...pastCardNumbers,
                ...presentCardNumbers,
                ...futureCardNumbers,
            ],
        });

        return {
            ...currentHand,
            [PtuOracleGameTime.Past]: currentHand?.[PtuOracleGameTime.Past].map(card => ({
                ...card,
                card: cards.find(pastCard => pastCard.cardNumber === card.cardNumber)!,
            })),
            [PtuOracleGameTime.Present]: currentHand?.[PtuOracleGameTime.Present].map(card => ({
                ...card,
                card: cards.find(pastCard => pastCard.cardNumber === card.cardNumber)!,
            })),
            [PtuOracleGameTime.Future]: currentHand?.[PtuOracleGameTime.Future].map(card => ({
                ...card,
                card: cards.find(pastCard => pastCard.cardNumber === card.cardNumber)!,
            })),
        };
    }

    public static async getHandsDetailed({ hands }: Pick<PtuOracleGameCollection, 'hands'>): Promise<PtuOraclePlayerHandDetailed[]>
    {
        const cards = await PtuOraclePseudoCache.getAllCards();
        const cardNumberToCard = cards.reduce<Record<number, PtuOracleCardCollection>>((acc, cur) =>
        {
            acc[cur.cardNumber] = cur;
            return acc;
        }, {});

        return hands.map(hand => ({
            ...hand,
            [PtuOracleGameTime.Past]: hand?.[PtuOracleGameTime.Past].map(card => ({
                ...card,
                card: cardNumberToCard[card.cardNumber],
            })),
            [PtuOracleGameTime.Present]: hand?.[PtuOracleGameTime.Present].map(card => ({
                ...card,
                card: cardNumberToCard[card.cardNumber],
            })),
            [PtuOracleGameTime.Future]: hand?.[PtuOracleGameTime.Future].map(card => ({
                ...card,
                card: cardNumberToCard[card.cardNumber],
            })),
        }));
    }

    public static async updateGameStatus(
        { id }: Pick<PtuOracleGameCollection, 'id'>,
        status: PtuOracleGameStatus,
    ): Promise<PtuOracleGameCollection>
    {
        // Update
        return await PtuOraclePseudoCache.updateGame(id.toString(), {
            status,
        });
    }

    private static async drawCards(cards: PtuOracleCardCollection[], numOfCards: number): Promise<{
        drawnCards: {
            card: PtuOracleCardCollection;
            face: PtuOracleCardProphecyFace;
        }[];
        updatedDeckCardNumbers: number[];
        shouldResetDiscards: boolean;
    }>
    {
        let cardsClone = [...cards];
        const drawnCards: {
            card: PtuOracleCardCollection;
            face: PtuOracleCardProphecyFace;
        }[] = [];
        let shouldResetDiscards = false;

        for (let index = 0; index < numOfCards; index += 1)
        {
            // Reset deck when there's no more cards left to draw
            if (cardsClone.length <= 0)
            {
                // eslint-disable-next-line no-await-in-loop -- Should only trigger once
                cardsClone = [...(await PtuOraclePseudoCache.getAllCards())].filter((cur) =>
                    drawnCards.every(drawnCard => drawnCard.card.cardNumber !== cur.cardNumber),
                );
                shouldResetDiscards = true;
            }
            const [roll] = new DiceLiteService({ count: 1, sides: cardsClone.length }).roll();
            const [face] = new DiceLiteService({ count: 1, sides: 2 }).roll();
            const [card] = cardsClone.splice(roll - 1, 1);
            drawnCards.push({
                card,
                face: face === 1
                    ? PtuOracleCardProphecyFace.Normal
                    : PtuOracleCardProphecyFace.Reverse,
            });
        }

        return {
            drawnCards,
            updatedDeckCardNumbers: cardsClone.map(card => card.cardNumber),
            shouldResetDiscards,
        };
    }

    public static getCurrentAndPriorElementsFromArray<T>(array: T[]): { current: T | undefined; prior: T[] }
    {
        const current = array[array.length - 1];
        const prior = array.slice(0, array.length - 1);

        return { current, prior };
    }

    private static getHandsTime(
        hand: PtuOraclePlayerHand | undefined,
        desiredAction: PtuOracleCardAction,
    ): {
            cards: PtuOracleCardDraw[];
            time: PtuOracleGameTime;
        }
    {
        if (!hand)
        {
            throw new Error('Cannot get time from undefined hand');
        }

        const hasFaceDownPast = hand[PtuOracleGameTime.Past].some(card => card.action === desiredAction);
        const hasFaceDownPresent = hand[PtuOracleGameTime.Present].some(card => card.action === desiredAction);
        const hasFaceDownFuture = hand[PtuOracleGameTime.Future].some(card => card.action === desiredAction);

        if (hasFaceDownPast && hand[PtuOracleGameTime.Past].length > 0)
        {
            return { cards: hand[PtuOracleGameTime.Past], time: PtuOracleGameTime.Past };
        }

        if (hasFaceDownPresent && hand[PtuOracleGameTime.Present].length > 0)
        {
            return { cards: hand[PtuOracleGameTime.Present], time: PtuOracleGameTime.Present };
        }

        if (hasFaceDownFuture && hand[PtuOracleGameTime.Future].length > 0)
        {
            return { cards: hand[PtuOracleGameTime.Future], time: PtuOracleGameTime.Future };
        }

        throw new Error('Cannot get time from hand with no face down cards');
    }

    private static getCardDefaultProphecy(
        card: PtuOracleCardCollection,
        face: PtuOracleCardProphecyFace,
    ): string
    {
        switch (face)
        {
            case PtuOracleCardProphecyFace.Normal:
                return card.defaultProphecy;
            case PtuOracleCardProphecyFace.Reverse:
                return card.defaultReverseProphecy;
            default:
                const typeCheck: never = face;
                throw new Error(`Unexpected card prophecy face: ${typeCheck}`);
        }
    }
}
