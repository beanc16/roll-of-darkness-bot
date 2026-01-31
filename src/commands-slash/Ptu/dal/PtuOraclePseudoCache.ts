import type { ObjectId } from 'mongodb';

import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import { PtuOracleCardCollection } from './models/PtuOracleCardCollection.js';
import { PtuOracleGameCollection } from './models/PtuOracleGameCollection.js';
import { OracleCardController } from './PtuOracleCardController.js';
import { OracleGameController } from './PtuOracleGameController.js';

export type PtuOracleGameToCreate = Omit<
    PtuOracleGameCollection,
    | '_id'
    | 'createdAt'
    | 'completedAt'
    | 'discardCardNumbers'
    | 'rounds'
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

        const { results } = await OracleCardController.getMostRecent({ cardNumber }) as {
            results: PtuOracleCardCollection | undefined;
        };

        if (!results)
        {
            throw new Error(`Could not find card with card number ${cardNumber}`);
        }

        return results;
    }

    public static async getGameById(id: ObjectId): Promise<PtuOracleGameCollection>
    {
        const { results } = await OracleGameController.getMostRecent({ _id: id }) as {
            results: PtuOracleGameCollection | undefined;
        };

        if (!results)
        {
            throw new Error(`Could not find game with id ${id.toString()}`);
        }

        return results;
    }

    public static async getGameByName(name: string): Promise<PtuOracleGameCollection>
    {
        const { results } = await OracleGameController.getMostRecent({ name }) as {
            results: PtuOracleGameCollection | undefined;
        };

        if (!results)
        {
            throw new Error(`Could not find game with name ${name}`);
        }

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
