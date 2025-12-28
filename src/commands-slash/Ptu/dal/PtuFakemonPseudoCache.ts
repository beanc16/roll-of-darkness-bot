import ptuFakemonSingleton from '../models/ptuFakemonSingleton.js';
import { PtuFakemonCollection } from './models/PtuFakemonCollection.js';
import { FakemonController } from './PtuFakemonController.js';

export type PtuFakemonToCreate = Omit<
    PtuFakemonCollection,
    | '_id'
    | 'id'
    | 'versionName'
    | 'olderVersions'
    | 'extras'
    | 'toPtuPokemon'
    | 'edits'
>;

export class PtuFakemonPseudoCache
{
    private static allFakemon: PtuFakemonCollection[] = [];

    public static async getAll(userId: string): Promise<PtuFakemonCollection[]>
    {
        if (this.allFakemon.length > 0)
        {
            return this.allFakemon;
        }

        const { results = [] } = await FakemonController.getAll({
            // Filter by user id
            editors: {
                $in: [userId],
            },
        }) as {
            results: PtuFakemonCollection[];
        };

        this.allFakemon = results;
        return results;
    }

    public static async getByNames(names: string[], userId: string): Promise<PtuFakemonCollection[]>
    {
        if (names.length === 0)
        {
            return [];
        }

        const { results = [] } = await FakemonController.getAll({
            // Filter by names
            $or: names.map((name) => ({ name })),
            // Filter by user id
            editors: {
                $in: [userId],
            },
        }) as {
            results: PtuFakemonCollection[];
        };

        return results;
    }

    public static getByMessageId(messageId: string): PtuFakemonCollection | undefined
    {
        return ptuFakemonSingleton.get(messageId);
    }

    public static async create(messageId: string, input: PtuFakemonToCreate): Promise<PtuFakemonCollection>
    {
        const {
            results: {
                model: fakemon,
            },
        } = await FakemonController.insertOneIfNotExists({
            // Don't allow duplicate names
            name: input.name,
        }, input) as {
            results: {
                model: PtuFakemonCollection;
            };
        };

        ptuFakemonSingleton.upsert(messageId, fakemon);
        this.allFakemon.push(fakemon);
        return fakemon;
    }

    public static async update(
        messageId: string,
        { id }: Pick<PtuFakemonCollection, 'id'>,
        updateData: Partial<PtuFakemonCollection>,
    ): Promise<PtuFakemonCollection>
    {
        const {
            results: {
                new: fakemon,
            },
        } = await FakemonController.findOneAndUpdate({
            _id: id,
        }, updateData) as {
            results: {
                new: PtuFakemonCollection;
            };
        };

        ptuFakemonSingleton.upsert(messageId, fakemon);

        const index = this.allFakemon.findIndex((f) => f.id === id);
        if (index !== -1)
        {
            this.allFakemon[index] = fakemon;
        }

        return fakemon;
    }

    public static addToCache(messageId: string, fakemon: PtuFakemonCollection): void
    {
        // Add to cache
        ptuFakemonSingleton.upsert(messageId, fakemon);

        // Add to allFakemon if not already there
        if (!this.allFakemon.every(element => element.id !== fakemon.id))
        {
            this.allFakemon.push(fakemon);
        }
    }
}
