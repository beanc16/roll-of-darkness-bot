/* eslint-disable max-classes-per-file */

import type { AtLeastOne } from '@beanc16/utility-types';

import {
    PtuCustomMoveArmorClass,
    PtuCustomMoveDamageBase,
    PtuCustomMoveFrequency,
    PtuMoveCollection,
    PtuMoveStatus,
} from '../../dal/models/PtuMoveCollection.js';
import { PtuMoveController } from '../../dal/PtuMoveController.js';
import { PtuMovePseudoCache } from '../../dal/PtuMovePseudoCache.js';
import { LookupKeywordStrategy } from '../../strategies/lookup/LookupKeywordStrategy.js';
import { LookupMoveStrategy } from '../../strategies/lookup/LookupMoveStrategy.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
} from '../../types/pokemon.js';
import { PtuKeywordType } from '../../types/PtuKeyword.js';

type PtuMoveCollectionOnlyId = AtLeastOne<PtuMoveCollection, 'id'>;

interface BaseMoveGeneralInformationManagerServiceParameters
{
    userId: string;
    move: PtuMoveCollectionOnlyId;
}

export class MoveGeneralInformationManagerService
{
    private static allStatuses = new Set(Object.values(PtuMoveStatus));
    private static allTypes = new Set(Object.values(PokemonType));
    private static allCategories = new Set(Object.values(PokemonMoveCategory));
    private static allFrequencies = new Set(Object.values(PtuCustomMoveFrequency));
    private static allDamageBases = new Set(Object.values(PtuCustomMoveDamageBase));
    private static allAcs = new Set(Object.values(PtuCustomMoveArmorClass));
    private static allContestStatEffects = new Set(Object.values(PtuContestStatEffect));
    private static allContestStatTypes = new Set(Object.values(PtuContestStatType));

    // From lookups
    private static allMoveNames = new Set<string>();
    private static allKeywordNames = new Set<string>();
    /** Exclude action type keywords, those are part of range instead */
    private static keywordNameBlacklist = new Set<string>(['Interrupt', 'Priority', 'Reaction', 'Trigger']);

    public static async updateName({
        userId,
        move,
        name,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        name: string;
    }): Promise<PtuMoveCollection>
    {
        if (name.trim().length === 0)
        {
            throw new Error('Move name cannot be empty');
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            name,
        }, userId);
    }

    public static async updateStatus({
        userId,
        move,
        status,
    }: {
        userId?: string;
        move: PtuMoveCollectionOnlyId;
        status: PtuMoveStatus;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allStatuses.has(status))
        {
            throw new Error(`Invalid status: ${status}`);
        }

        if (userId)
        {
            return await PtuMovePseudoCache.update({ id: move.id }, {
                status,
            }, userId);
        }

        const {
            results: {
                new: output,
            },
        } = await PtuMoveController.findOneAndUpdate({
            _id: move.id,
        }, { status }) as {
            results: {
                new: PtuMoveCollection;
            };
        };

        return output;
    }

    public static async updateTransferredTo({ move, isTransferred }: {
        move: PtuMoveCollectionOnlyId;
        isTransferred: boolean;
    }): Promise<PtuMoveCollection>
    {
        const updateData: Record<string, boolean> = { isTransferred };

        const {
            results: {
                new: output,
            },
        } = await PtuMoveController.findOneAndUpdate({
            id: move.id,
        }, updateData) as {
            results: {
                new: PtuMoveCollection;
            };
        };

        return output;
    }

    public static async updateType({
        userId,
        move,
        type,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        type: PokemonType;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allTypes.has(type))
        {
            throw new Error(`Invalid type: ${type}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            type,
        }, userId);
    }

    public static async updateCategory({
        userId,
        move,
        category,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        category: PokemonMoveCategory;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allCategories.has(category))
        {
            throw new Error(`Invalid category: ${category}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            category,
        }, userId);
    }

    public static async updateFrequency({
        userId,
        move,
        frequency,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        frequency: PtuCustomMoveFrequency;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allFrequencies.has(frequency))
        {
            throw new Error(`Invalid frequency: ${frequency}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            frequency,
        }, userId);
    }

    public static async updateDamageBase({
        userId,
        move,
        damageBase,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        damageBase: PtuCustomMoveDamageBase;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allDamageBases.has(damageBase))
        {
            throw new Error(`Invalid damageBase: ${damageBase}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            damageBase,
        }, userId);
    }

    public static async updateArmorClass({
        userId,
        move,
        ac,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        ac: PtuCustomMoveArmorClass;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allAcs.has(ac))
        {
            throw new Error(`Invalid ac: ${ac}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            ac,
        }, userId);
    }

    public static async updateContestStatEffect({
        userId,
        move,
        contestStatEffect,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        contestStatEffect: PtuContestStatEffect;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allContestStatEffects.has(contestStatEffect))
        {
            throw new Error(`Invalid contest stat effect: ${contestStatEffect}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            contestStatEffect,
        }, userId);
    }

    public static async updateContestStatType({
        userId,
        move,
        contestStatType,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        contestStatType: PtuContestStatType;
    }): Promise<PtuMoveCollection>
    {
        if (!this.allContestStatTypes.has(contestStatType))
        {
            throw new Error(`Invalid contest stat type: ${contestStatType}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            contestStatType,
        }, userId);
    }

    public static async updateEffects({
        userId,
        move,
        effects,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        effects: string;
    }): Promise<PtuMoveCollection>
    {
        if (effects.trim().length === 0)
        {
            throw new Error('Move effects cannot be empty');
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            effects,
        }, userId);
    }

    public static async updateKeywords({
        userId,
        move,
        keywords,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        keywords: [string?, string?, string?, string?];
    }): Promise<PtuMoveCollection>
    {
        const { truthyKeywords, falseyKeywords } = keywords.reduce<{
            truthyKeywords: [string?, string?, string?, string?];
            falseyKeywords: [string?, string?, string?, string?];
        }>((acc, keyword) =>
        {
            if (keyword?.trim())
            {
                acc.truthyKeywords.push(keyword.trim());
            }
            else
            {
                acc.falseyKeywords.push(keyword);
            }
            return acc;
        }, { truthyKeywords: [], falseyKeywords: [] });

        if (falseyKeywords.length > 0)
        {
            throw new Error('Move cannot have empty keywords');
        }

        if (truthyKeywords.length === 0 || truthyKeywords.length > 4)
        {
            throw new Error('Move must have 1-4 keywords');
        }

        const allKeywordNames = await this.getValidKeywordNames({ returnType: 'set' });

        const invalidKeywords = truthyKeywords.filter((keyword) => keyword && !allKeywordNames.has(keyword));
        if (invalidKeywords.length > 0)
        {
            throw new Error(`Invalid keywords: ${invalidKeywords.join(', ')}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            keywords: truthyKeywords,
        }, userId);
    }

    public static async updateBasedOn({
        userId,
        move,
        basedOnMoveName,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        basedOnMoveName: string;
    }): Promise<PtuMoveCollection>
    {
        // Initialize if not set
        if (this.allMoveNames.size === 0)
        {
            const allMoves = await LookupMoveStrategy.getLookupData({ includeAllIfNoName: true });
            allMoves.forEach((curMove) => this.allMoveNames.add(curMove.name));
        }

        if (!this.allMoveNames.has(basedOnMoveName))
        {
            throw new Error(`Invalid based on move name: ${basedOnMoveName}`);
        }

        return await PtuMovePseudoCache.update({ id: move.id }, {
            basedOn: basedOnMoveName,
        }, userId);
    }

    // Getters
    public static async getValidKeywordNames({ returnType }: { returnType: 'set' }): Promise<Set<string>>;
    public static async getValidKeywordNames({ returnType }: { returnType: 'array' }): Promise<string[]>;
    public static async getValidKeywordNames({ returnType = 'array' }: { returnType: 'set' | 'array' }): Promise<Set<string> | string[]>
    {
        // Initialize if not set
        if (this.allKeywordNames.size === 0)
        {
            const allKeywords = await LookupKeywordStrategy.getLookupData({ includeAllIfNoName: true });
            allKeywords.forEach((keyword) =>
            {
                if (keyword.type === PtuKeywordType.Move && !this.keywordNameBlacklist.has(keyword.name))
                {
                    this.allKeywordNames.add(keyword.name);
                }
            });
        }

        // Set
        if (returnType === 'set')
        {
            return this.allKeywordNames;
        }

        // Array
        return [...this.allKeywordNames];
    }
}
