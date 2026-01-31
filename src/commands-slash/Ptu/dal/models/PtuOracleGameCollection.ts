import { ObjectId } from 'mongodb';

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
    Rejected = 'Rejected',
    Questioned = 'Questioned',
}

export type PtuOracleCardDraw = { cardNumber: number; prophecy: string } & ({
    action: Omit<PtuOracleCardAction, PtuOracleCardAction.Questioned>;
    playerQuestion?: never;
} | {
    action: PtuOracleCardAction.Questioned;
    playerQuestion: string;
});

export interface PtuOraclePlayerHand
{
    playerDiscordUserId: string;
    past: PtuOracleCardDraw[];
    present: PtuOracleCardDraw[];
    future: PtuOracleCardDraw[];
    isCompleted: boolean;
}

export interface PtuOracleRound
{
    roundNumber: number;
    /** Assume the latest hand in the array is the current hand */
    hands: PtuOraclePlayerHand[];
}

export class PtuOracleGameCollection
{
    public _id: ObjectId;
    public name: string;
    public status: PtuOracleGameStatus;
    public dealerDiscordUserId: string;
    public playerDiscordUserIds: string[];
    public deckCardNumbers: number[];
    public discardCardNumbers: number[];
    /** Assume the latest round in the array is the current round */
    public rounds: PtuOracleRound[];
    public createdAt: Date;
    public completedAt?: Date;

    constructor({
        _id,
        name,
        status = PtuOracleGameStatus.Active,
        dealerDiscordUserId,
        playerDiscordUserIds = [],
        deckCardNumbers,
        discardCardNumbers = [],
        rounds = [],
        createdAt = new Date(),
        completedAt,
    }: {
        _id?: ObjectId;
        name: string;
        status?: PtuOracleGameStatus;
        dealerDiscordUserId: string;
        playerDiscordUserIds?: string[];
        deckCardNumbers: number[];
        discardCardNumbers?: number[];
        rounds?: PtuOracleRound[];
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
        this.dealerDiscordUserId = dealerDiscordUserId;
        this.playerDiscordUserIds = playerDiscordUserIds;
        this.deckCardNumbers = deckCardNumbers;
        this.discardCardNumbers = discardCardNumbers;
        this.rounds = rounds;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }
}
