import { RecordSingleton } from '../../../services/Singleton/RecordSingleton.js';
import { PtuMoveCollection } from './models/PtuMoveCollection.js';
import { PtuMoveController } from './PtuMoveController.js';

export type PtuMoveToCreate = Omit<
    PtuMoveCollection,
    | '_id'
    | 'id'
    | 'isTransferred'
    | 'isDeleted'
    | 'deletedAt'
>;

export class PtuMovePseudoCache
{
    private static userIdToAllMoves: RecordSingleton<string, PtuMoveCollection[]> = new RecordSingleton();

    public static async getAll(userId: string): Promise<PtuMoveCollection[]>
    {
        const { results = [] } = await PtuMoveController.getAll({
            // Filter by user id
            editors: {
                $in: [userId],
            },
            $nor: [{ isDeleted: true }],
        }) as {
            results: PtuMoveCollection[];
        };

        this.userIdToAllMoves.upsert(userId, results);
        return results;
    }

    public static async getById(id: string, userId: string): Promise<PtuMoveCollection[]>
    {
        const { results = [] } = await PtuMoveController.getAll({
            _id: id,
            // Filter by user id
            editors: {
                $in: [userId],
            },
            $nor: [{ isDeleted: true }],
        }) as {
            results: PtuMoveCollection[];
        };

        return results;
    }

    public static async getByDiscordUserId(userId: string): Promise<PtuMoveCollection[]>
    {
        const { results = [] } = await PtuMoveController.getAll({
            // Filter by user id
            editors: {
                $in: [userId],
            },
            $nor: [{ isDeleted: true }],
        }) as {
            results: PtuMoveCollection[];
        };

        return results;
    }

    public static async create(input: PtuMoveToCreate): Promise<PtuMoveCollection>
    {
        const {
            results: {
                model: fakemon,
            },
        } = await PtuMoveController.insertOneIfNotExists({
            // Don't allow duplicate names
            name: input.name,
            $nor: [{ isDeleted: true }],
        }, input) as {
            results: {
                model: PtuMoveCollection;
            };
        };

        // Add the move to each user's cached list
        const { editorDiscordUserIds } = input;

        editorDiscordUserIds.forEach((editorDiscordUserId) =>
        {
            this.userIdToAllMoves.get(editorDiscordUserId)?.push(fakemon);
        });

        return fakemon;
    }

    public static async update(
        { id }: Pick<PtuMoveCollection, 'id'>,
        updateData: Partial<PtuMoveCollection>,
        userId: string,
    ): Promise<PtuMoveCollection>
    {
        const {
            results: {
                new: fakemon,
            },
        } = await PtuMoveController.findOneAndUpdate({
            _id: id,
            // Filter by user id
            editors: {
                $in: [userId],
            },
        }, updateData) as {
            results: {
                new: PtuMoveCollection;
            };
        };

        // Add the move to each user's cached list
        const { editorDiscordUserIds } = fakemon;

        editorDiscordUserIds.forEach((editorDiscordUserId) =>
        {
            this.userIdToAllMoves.get(editorDiscordUserId)?.push(fakemon);
        });

        return fakemon;
    }

    public static async softDelete(
        { id }: Pick<PtuMoveCollection, 'id'>,
        userId: string,
    ): Promise<void>
    {
        // Update deleted flags
        const {
            results: {
                new: fakemon,
            },
        } = await PtuMoveController.findOneAndUpdate({
            _id: id,
            // Filter by user id
            editors: {
                $in: [userId],
            },
        }, {
            isDeleted: true,
            deletedAt: new Date(),
        }) as {
            results: {
                new: PtuMoveCollection;
            };
        };

        // Add the move to each user's cached list
        const { editorDiscordUserIds } = fakemon;

        editorDiscordUserIds.forEach((editorDiscordUserId) =>
        {
            this.userIdToAllMoves.remove(editorDiscordUserId);
        });
    }
}
