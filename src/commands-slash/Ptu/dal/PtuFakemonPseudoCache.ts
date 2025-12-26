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
        return fakemon;
    }
}
