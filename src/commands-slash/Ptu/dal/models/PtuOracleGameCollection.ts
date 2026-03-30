import { ObjectId } from 'mongodb';

import { PtuOracleCardCollection, PtuOracleCardProphecyFace } from './PtuOracleCardCollection.js';

export enum PtuOracleGameTime
{
    Past = 'past',
    Present = 'present',
    Future = 'future',
}

export enum PtuOracleGameStatus
{
    Active = 'Active',
    Complete = 'Complete',
}

export enum PtuOracleCardAction
{
    /** When the card is drawn but not yet revealed */
    FaceDown = 'Face Down',
    /** When the card is drawn and revealed, but not accepted/rejected/questioned */
    FaceUp = 'Face Up',
    Accepted = 'Accepted',
    Denied = 'Denied',
    Questioned = 'Questioned',
}

export type PtuOracleCardDraw = {
    cardNumber: number;
    prophecy: string;
    face: PtuOracleCardProphecyFace;
} & ({
    action: Omit<PtuOracleCardAction, PtuOracleCardAction.Questioned>;
    playerQuestion?: never;
} | {
    action: PtuOracleCardAction.Questioned;
    playerQuestion: string;
});

export type PtuOracleCardDrawDetailed = PtuOracleCardDraw & {
    card: PtuOracleCardCollection;
};

export interface PtuOraclePlayerHand
{
    playerDiscordUserId: string;
    [PtuOracleGameTime.Past]: PtuOracleCardDraw[];
    [PtuOracleGameTime.Present]: PtuOracleCardDraw[];
    [PtuOracleGameTime.Future]: PtuOracleCardDraw[];
    isCompleted: boolean;
}

export interface PtuOraclePlayerHandDetailed extends Omit<PtuOraclePlayerHand, PtuOracleGameTime>
{
    [PtuOracleGameTime.Past]: PtuOracleCardDrawDetailed[];
    [PtuOracleGameTime.Present]: PtuOracleCardDrawDetailed[];
    [PtuOracleGameTime.Future]: PtuOracleCardDrawDetailed[];
}

export class PtuOracleGameCollection
{
    public _id: ObjectId;
    public name: string;
    public status: PtuOracleGameStatus;
    public topic?: string;
    public dealerDiscordUserId: string;
    public playerDiscordUserIds: string[];
    public deckCardNumbers: number[];
    public discardCardNumbers: number[];
    /** Assume the latest hand in the array is the current hand */
    public hands: PtuOraclePlayerHand[];
    public createdAt: Date;
    public completedAt?: Date;

    constructor({
        _id,
        name,
        status = PtuOracleGameStatus.Active,
        topic,
        dealerDiscordUserId,
        playerDiscordUserIds = [],
        deckCardNumbers,
        discardCardNumbers = [],
        hands = [],
        createdAt = new Date(),
        completedAt,
    }: {
        _id?: ObjectId;
        name: string;
        status?: PtuOracleGameStatus;
        topic?: string;
        dealerDiscordUserId: string;
        playerDiscordUserIds?: string[];
        deckCardNumbers: number[];
        discardCardNumbers?: number[];
        hands?: PtuOraclePlayerHand[];
        createdAt?: Date;
        completedAt?: Date;
    })
    {
        if (_id)
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = _id;
        }
        else
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = new ObjectId();
        }

        this.name = name;
        this.status = status;
        this.topic = topic;
        this.dealerDiscordUserId = dealerDiscordUserId;
        this.playerDiscordUserIds = playerDiscordUserIds;
        this.deckCardNumbers = deckCardNumbers;
        this.discardCardNumbers = discardCardNumbers;
        this.hands = hands;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    get id(): string
    {
        // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
        return this._id.toString();
    }
}
