import { ComponentType, type StringSelectMenuInteraction } from 'discord.js';

import { FakemonMovesStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/moves/types.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PokemonType } from '../../types/pokemon.js';
import { FakemonInteractionManagerPage } from '../FakemonInteractionManagerService/types.js';

export class FakemonMoveManagerService
{
    public static readonly MAX_LEVEL_UP_MOVES = 35;
    public static readonly MAX_EGG_MOVES = 20;
    public static readonly MAX_TUTOR_AND_TMHM_MOVES = 75;
    public static readonly MAX_MOVE_NAME_LENGTH = 100;

    public static async addLevelUpMove({
        messageId,
        fakemon,
        move,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        move: PtuFakemonCollection['moveList']['levelUp'][number];
    }): Promise<PtuFakemonCollection>
    {
        this.validateLevelUpMove(move);

        // Sort movelist
        const sortedLevelUpMoves = this.sortLevelUpMoves([
            ...fakemon.moveList.levelUp,
            move,
        ]);
        if (sortedLevelUpMoves.length > this.MAX_LEVEL_UP_MOVES)
        {
            throw new Error(`Fakemon cannot have more than ${this.MAX_LEVEL_UP_MOVES} moves`);
        }
        const nameToMove: Record<string, PtuFakemonCollection['moveList']['levelUp'][number] | undefined> = {};
        const duplicateMoves = sortedLevelUpMoves.filter((curMove) =>
        {
            const existingMove = nameToMove[curMove.move];

            // Move is a duplicate
            if (existingMove && curMove.move.trim() === existingMove.move.trim())
            {
                return true;
            }

            nameToMove[curMove.move] = curMove;
            return false;
        });

        if (duplicateMoves.length > 0)
        {
            throw new Error(`Fakemon cannot have duplicate moves: ${duplicateMoves.map((curMove) => curMove.move).join(', ')}`);
        }

        // Update fakemon
        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            moveList: {
                ...fakemon.moveList,
                levelUp: sortedLevelUpMoves,
            },
        });
    }

    public static async editLevelUpMove({
        messageId,
        fakemon,
        oldMove,
        newMove,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        oldMove: PtuFakemonCollection['moveList']['levelUp'][number];
        newMove: PtuFakemonCollection['moveList']['levelUp'][number];
    }): Promise<PtuFakemonCollection>
    {
        // Validate old move
        try
        {
            this.validateLevelUpMove(oldMove);
        }
        catch (error)
        {
            throw new Error(`Invalid old move: ${(error as Error).message}`);
        }

        // Validate new move
        try
        {
            this.validateLevelUpMove(newMove);
        }
        catch (error)
        {
            throw new Error(`Invalid new move: ${(error as Error).message}`);
        }

        // Get old move index
        const moveList = [...fakemon.moveList.levelUp]; // Create a copy so we don't mutate the original
        const oldIndex = moveList.findIndex((move) => move.move === oldMove.move && move.level === oldMove.level);

        // Check for duplicate moves
        const duplicateMoves = moveList.filter((move, index) =>
            move.move.trim() === newMove.move.trim()
            && index !== oldIndex,
        );
        if (duplicateMoves.length > 0)
        {
            throw new Error(`Fakemon cannot have duplicate moves: ${duplicateMoves.map((move) => move.move).join(', ')}`);
        }

        // Replace old move with new move
        moveList[oldIndex] = newMove;

        // Update fakemon
        const sortedLevelUpMoves = this.sortLevelUpMoves(moveList);
        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            moveList: {
                ...fakemon.moveList,
                levelUp: sortedLevelUpMoves,
            },
        });
    }

    public static async addNonLevelUpMoves({
        messageId,
        fakemon,
        names,
        moveListToAddTo,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        names: string[];
        moveListToAddTo: Omit<keyof PtuFakemonCollection['moveList'], 'levelUp'>;
    }): Promise<PtuFakemonCollection>
    {
        if (names.some(name => name.trim().length === 0))
        {
            throw new Error('Move name cannot be empty');
        }
        if (names.some(name => name.trim().length > FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH))
        {
            throw new Error(`Move name cannot be longer than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`);
        }

        // Get movelist
        const moveList = fakemon.moveList[moveListToAddTo as keyof PtuFakemonCollection['moveList']] as string[] | undefined;
        if (!moveList)
        {
            return fakemon;
        }

        // Sort movelist
        const sortedMoves = [
            ...new Set([
                // Prevent duplicates
                ...moveList,
                ...names,
            ]),
        ].sort();
        if (moveListToAddTo === 'eggMoves' && sortedMoves.length > this.MAX_EGG_MOVES)
        {
            throw new Error(`Fakemon cannot have more than ${this.MAX_EGG_MOVES} egg moves`);
        }
        else if ((moveListToAddTo === 'tutorMoves' || moveListToAddTo === 'tmHm') && sortedMoves.length > this.MAX_TUTOR_AND_TMHM_MOVES)
        {
            const label = (moveListToAddTo === 'tutorMoves')
                ? 'tutor'
                : 'tm/hm';
            throw new Error(`Fakemon cannot have more than ${this.MAX_TUTOR_AND_TMHM_MOVES} ${label} moves`);
        }

        // Update fakemon
        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            moveList: {
                ...fakemon.moveList,
                [moveListToAddTo as keyof PtuFakemonCollection['moveList']]: sortedMoves,
            },
        });
    }

    public static async removeMoves({
        messageId,
        fakemon,
        names,
        moveListToRemoveFrom,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        names: string[];
        moveListToRemoveFrom: keyof PtuFakemonCollection['moveList'];
    }): Promise<PtuFakemonCollection>
    {
        // Get movelist
        const moveList = fakemon.moveList[moveListToRemoveFrom];
        if (!moveList)
        {
            return fakemon;
        }

        // Validate
        if (names.some(name => name.trim().length === 0))
        {
            throw new Error('Move name cannot be empty');
        }

        // Get moves in movelist
        const isNonLevelUpMovelist = (typeof moveList[0] === 'string');
        const { removedMoves, updatedMoveList } = isNonLevelUpMovelist
            ? (moveList as string[]).reduce<{ removedMoves: string[]; updatedMoveList: string[] }>((acc, cur) =>
            {
                if (names.includes(cur))
                {
                    acc.removedMoves.push(cur);
                }
                else
                {
                    acc.updatedMoveList.push(cur);
                }
                return acc;
            }, { removedMoves: [], updatedMoveList: [] })
            : (moveList as PtuFakemonCollection['moveList']['levelUp']).reduce<{ removedMoves: PtuFakemonCollection['moveList']['levelUp']; updatedMoveList: PtuFakemonCollection['moveList']['levelUp'] }>((acc, cur) =>
            {
                if (names.includes(cur.move))
                {
                    acc.removedMoves.push(cur);
                }
                else
                {
                    acc.updatedMoveList.push(cur);
                }
                return acc;
            }, { removedMoves: [], updatedMoveList: [] });

        const missingMoves = removedMoves.length === names.length
            ? []
            : names.filter(name => !removedMoves.some(move =>
                typeof move === 'string'
                    ? move === name
                    : move.move === name,
            ));

        // Validate moves
        if (missingMoves.length > 0)
        {
            throw new Error(`Fakemon does not have ${moveListToRemoveFrom} moves called ${missingMoves.join(', ')}`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            moveList: {
                ...fakemon.moveList,
                [moveListToRemoveFrom]: updatedMoveList,
            },
        });
    }

    /**
     * @returns All moves in the original string select menu
     * options that are no longer in the values
     */
    public static getRemovedMovesFromStringSelectOptions({
        interaction,
        values,
        customId,
    }: {
        interaction: StringSelectMenuInteraction;
        /** The values to keep from the CURRENT string select menu */
        values: string[];
        customId: string;
    }): string[]
    {
        const valuesSet = new Set(values);

        return interaction.message.components.reduce<string[]>((acc, { components }) =>
        {
            components.forEach((component) =>
            {
                if (component.type === ComponentType.StringSelect && component.customId === customId)
                {
                    component.options.forEach(({ value }) =>
                    {
                        if (!valuesSet.has(value))
                        {
                            acc.push(value);
                        }
                    });
                }
                else if (component.type !== ComponentType.StringSelect && component.customId === customId)
                {
                    throw new Error('Component is not a string select menu');
                }
            });
            return acc;
        }, []);
    }

    private static validateLevelUpMove(move: PtuFakemonCollection['moveList']['levelUp'][number]): void
    {
        // Validate move name
        if (move.move.trim().length === 0)
        {
            throw new Error('Move name cannot be empty');
        }

        // Validate type
        if (!Object.values(PokemonType).some((type) => move.type === type.toString() || move.type === 'Unknown'))
        {
            throw new Error('Move type is invalid');
        }

        // Validate level (it's not always a number, but if it is, make sure the number is valid)
        const parsedLevel = parseInt(move.level.toString(), 10);
        if (Number.isSafeInteger(parsedLevel) && parsedLevel < 0)
        {
            throw new Error('Move level cannot be negative');
        }
        if (Number.isSafeInteger(parsedLevel) && parsedLevel > 100)
        {
            throw new Error('Move level cannot be greater than 100');
        }

        // Validate move name length
        if (move.move.length > FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
        {
            throw new Error(`Move name cannot be longer than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`);
        }
    }

    private static sortLevelUpMoves(moves: PtuFakemonCollection['moveList']['levelUp']): PtuFakemonCollection['moveList']['levelUp']
    {
        // Create a copy of the array to avoid mutating the original,
        // then sort by level, type, then move name.
        return [...moves].sort((a, b) =>
        {
            const aLevel = parseInt(a.level.toString(), 10);
            const bLevel = parseInt(b.level.toString(), 10);
            const isAInteger = Number.isSafeInteger(aLevel);
            const isBInteger = Number.isSafeInteger(bLevel);

            // If both are integers, sort by level, then by type
            if (isAInteger && isBInteger)
            {
                const result = aLevel - bLevel;
                if (result !== 0)
                {
                    return result;
                }

                const typeResult = a.type.localeCompare(b.type);
                if (typeResult !== 0)
                {
                    return typeResult;
                }

                return a.move.localeCompare(b.move);
            }

            // If one is an integer, put it second
            if (!isAInteger && isBInteger)
            {
                return -1;
            }
            if (isAInteger && !isBInteger)
            {
                return 1;
            }

            // If both are not integers, sort by type, then by move name
            const result = a.type.localeCompare(b.type);
            if (result !== 0)
            {
                return result;
            }

            return a.move.localeCompare(b.move);
        });
    }

    public static getMoveListByCustomId(
        customId: FakemonMovesStringSelectCustomIds.RemoveEggMoves
            | FakemonMovesStringSelectCustomIds.RemoveTmHmMoves
            | FakemonMovesStringSelectCustomIds.RemoveTutorMoves,
        { moveList }: Pick<PtuFakemonCollection, 'moveList'>,
    ): string[]
    {
        switch (customId)
        {
            case FakemonMovesStringSelectCustomIds.RemoveEggMoves:
                return moveList.eggMoves;
            case FakemonMovesStringSelectCustomIds.RemoveTmHmMoves:
                return moveList.tmHm;
            case FakemonMovesStringSelectCustomIds.RemoveTutorMoves:
                return moveList.tutorMoves;
            default:
                const typeCheck: never = customId;
                throw new Error(`Unhandled customId: ${typeCheck}`);
        }
    }

    public static getInteractionPageByMoveListKey(moveListKey: 'eggMoves' | 'tmHm' | 'tutorMoves'): FakemonInteractionManagerPage
    {
        switch (moveListKey)
        {
            case 'eggMoves':
                return FakemonInteractionManagerPage.EggMoves;
            case 'tmHm':
                return FakemonInteractionManagerPage.TmHmMoves;
            case 'tutorMoves':
                return FakemonInteractionManagerPage.TutorMoves;
            default:
                const typeCheck: never = moveListKey;
                throw new Error(`Unhandled moveListKey: ${typeCheck}`);
        }
    }
}
