import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import { PtuOracleCardCollection } from './models/PtuOracleCardCollection.js';
import { PtuOracleGameCollection } from './models/PtuOracleGameCollection.js';
import { OracleCardController } from './PtuOracleCardController.js';
import { OracleGameController } from './PtuOracleGameController.js';

export type PtuOracleGameToCreate = Omit<
    PtuOracleGameCollection,
    | '_id'
    | 'id'
    | 'createdAt'
    | 'completedAt'
    | 'discardCardNumbers'
    | 'hands'
    | 'status'
>;

export class PtuOraclePseudoCache
{
    private static cardNumberToOracleCard = new RecordSingleton<number, PtuOracleCardCollection>();
    private static allCards: PtuOracleCardCollection[] = [];

    public static async getAllCards(): Promise<PtuOracleCardCollection[]>
    {
        if (this.allCards.length > 0)
        {
            return this.allCards;
        }

        const { results = [] } = await OracleCardController.getAll() as {
            results: PtuOracleCardCollection[];
        };
        this.allCards = results;

        this.allCards.forEach((card) =>
        {
            this.cardNumberToOracleCard.upsert(card.cardNumber, card);
        });

        return results;
    }

    public static async getCards({ including = [], excluding = [] }: {
        including?: number[];
        excluding?: number[];
    }): Promise<PtuOracleCardCollection[]>
    {
        if (this.allCards.length > 0)
        {
            return this.allCards.filter((card) =>
                including.includes(card.cardNumber)
                && !excluding.includes(card.cardNumber),
            );
        }

        const { results = [] } = await OracleCardController.getAll() as {
            results: PtuOracleCardCollection[];
        };
        this.allCards = results;

        this.allCards.forEach((card) =>
        {
            this.cardNumberToOracleCard.upsert(card.cardNumber, card);
        });

        return results.filter((card) =>
            including.includes(card.cardNumber)
            && !excluding.includes(card.cardNumber),
        );
    }

    public static async getCardByCardNumber(cardNumber: number): Promise<PtuOracleCardCollection>
    {
        const cachedCard = this.cardNumberToOracleCard.get(cardNumber);
        if (cachedCard)
        {
            return cachedCard;
        }

        const result = await OracleCardController.getMostRecent({ cardNumber }) as PtuOracleCardCollection | undefined;

        if (!result)
        {
            throw new Error(`Could not find card with card number ${cardNumber}`);
        }

        return result;
    }

    public static async getGameById(id: string): Promise<PtuOracleGameCollection>
    {
        const result = await OracleGameController.getMostRecent({ _id: id }) as PtuOracleGameCollection | undefined;

        if (!result)
        {
            throw new Error(`Could not find oracle game with id ${id.toString()}`);
        }

        return result;
    }

    public static async getGameByName(name: string): Promise<PtuOracleGameCollection>
    {
        const result = await OracleGameController.getMostRecent({ name }) as PtuOracleGameCollection | undefined;

        if (!result)
        {
            throw new Error(`Could not find oracle game with name ${name.toString()}`);
        }

        return result;
    }

    public static async getGamesByDiscordUserId(discordUserId: string): Promise<PtuOracleGameCollection[]>
    {
        const { results = [] } = await OracleGameController.getAll({
            $or: [
                { dealerDiscordUserId: discordUserId },
                { playerDiscordUserIds: { $in: [discordUserId] } },
            ],
        }) as {
            results: PtuOracleGameCollection[];
        };

        return results;
    }

    public static async createGame(input: PtuOracleGameToCreate): Promise<PtuOracleGameCollection>
    {
        const {
            results: {
                model: game,
            },
        } = await OracleGameController.insertOneIfNotExists({
            // Don't allow duplicate names
            name: input.name,
        }, input) as {
            results: {
                model: PtuOracleGameCollection;
            };
        };

        return game;
    }

    public static async updateGame(
        id: string,
        updateData: Omit<Partial<PtuOracleGameCollection>, '_id' | 'createdAt' | 'completedAt'>,
    ): Promise<PtuOracleGameCollection>
    {
        const {
            results: {
                new: game,
            },
        } = await OracleGameController.findOneAndUpdate({
            _id: id,
        }, updateData) as {
            results: {
                new: PtuOracleGameCollection;
            };
        };

        return game;
    }
}
