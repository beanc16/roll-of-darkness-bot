import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';

import { getFakeDiscordId, getFakeDiscordIds } from '../../../fakes/discord/ids.js';
import {
    PtuOracleCardCategory,
    PtuOracleCardCollection,
    PtuOracleCardProphecyFace,
} from '../dal/models/PtuOracleCardCollection.js';
import {
    PtuOracleCardAction,
    PtuOracleCardDraw,
    PtuOracleGameCollection,
    PtuOracleGameStatus,
    PtuOracleGameTime,
    PtuOraclePlayerHand,
} from '../dal/models/PtuOracleGameCollection.js';

export const createPtuOracleCardCollectionData = ({
    cardNumber = faker.number.int({ min: 1, max: 100 }),
    name = faker.lorem.word(),
    descriptor = faker.lorem.word(),
    category = faker.helpers.arrayElement(Object.values(PtuOracleCardCategory)),
    defaultProphecy = faker.lorem.sentence(),
    defaultReverseProphecy = faker.lorem.sentence(),
}: {
    cardNumber?: number;
    name?: string;
    descriptor?: string;
    category?: string;
    defaultProphecy?: string;
    defaultReverseProphecy?: string;
} = {}): PtuOracleCardCollection =>
    new PtuOracleCardCollection({
        _id: new ObjectId(faker.database.mongodbObjectId()),
        cardNumber,
        name,
        descriptor,
        category,
        defaultProphecy,
        defaultReverseProphecy,
    });

export const createPtuOracleCardDrawData = ({
    cardNumber = faker.number.int({ min: 1, max: 100 }),
    prophecy = faker.lorem.sentence(),
    face = faker.helpers.arrayElement(Object.values(PtuOracleCardProphecyFace)),
    action = PtuOracleCardAction.FaceDown,
    playerQuestion,
}: {
    cardNumber?: number;
    prophecy?: string;
    face?: PtuOracleCardProphecyFace;
    action?: PtuOracleCardAction;
    playerQuestion?: string;
} = {}): PtuOracleCardDraw =>
{
    if (action === PtuOracleCardAction.Questioned)
    {
        return {
            cardNumber,
            prophecy,
            face,
            action,
            playerQuestion: playerQuestion ?? faker.lorem.sentence(),
        };
    }

    return {
        cardNumber,
        prophecy,
        face,
        action,
    };
};

export const createPtuOraclePlayerHandData = ({
    playerDiscordUserId = getFakeDiscordId(),
    topic = faker.lorem.sentence(),
    past = [],
    present = [],
    future = [],
    isCompleted = false,
}: {
    playerDiscordUserId?: string;
    topic?: string;
    past?: PtuOracleCardDraw[];
    present?: PtuOracleCardDraw[];
    future?: PtuOracleCardDraw[];
    isCompleted?: boolean;
} = {}): PtuOraclePlayerHand =>
    ({
        playerDiscordUserId,
        topic,
        [PtuOracleGameTime.Past]: past,
        [PtuOracleGameTime.Present]: present,
        [PtuOracleGameTime.Future]: future,
        isCompleted,
    });

export const createPtuOracleGameCollectionData = ({
    name = faker.lorem.word(),
    status = PtuOracleGameStatus.Active,
    dealerDiscordUserId = getFakeDiscordId(),
    playerDiscordUserIds = getFakeDiscordIds(),
    deckCardNumbers = Array.from({ length: 53 }, (_, i) => i + 1),
    discardCardNumbers = [],
    hands = [],
}: {
    name?: string;
    status?: PtuOracleGameStatus;
    dealerDiscordUserId?: string;
    playerDiscordUserIds?: string[];
    deckCardNumbers?: number[];
    discardCardNumbers?: number[];
    hands?: PtuOraclePlayerHand[];
} = {}): PtuOracleGameCollection =>
    new PtuOracleGameCollection({
        _id: new ObjectId(faker.database.mongodbObjectId()),
        name,
        status,
        dealerDiscordUserId,
        playerDiscordUserIds,
        deckCardNumbers,
        discardCardNumbers,
        hands,
    });
