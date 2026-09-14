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
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
} from '../../types/pokemon.js';
import { PtuValidationService } from './PtuValidationService.js';

type PtuMoveCollectionOnlyId = AtLeastOne<PtuMoveCollection, 'id'>;

interface BaseMoveGeneralInformationManagerServiceParameters
{
    userId: string;
    move: PtuMoveCollectionOnlyId;
}

export class MoveGeneralInformationManagerService
{
    public static async updateName({
        userId,
        move,
        name,
    }: BaseMoveGeneralInformationManagerServiceParameters & {
        name: string;
    }): Promise<PtuMoveCollection>
    {
        PtuValidationService.validateName(name);

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
        PtuValidationService.validateStatus(status);

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
        PtuValidationService.validateIsTransferred(isTransferred);
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
        PtuValidationService.validateType(type);

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
        PtuValidationService.validateCategory(category);

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
        PtuValidationService.validateFrequency(frequency);

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
        PtuValidationService.validateDamageBase(damageBase);

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
        PtuValidationService.validateArmorClass(ac);

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
        PtuValidationService.validateContestStatEffect(contestStatEffect);

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
        PtuValidationService.validateContestStatType(contestStatType);

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
        PtuValidationService.validateEffects(effects);

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
        const truthyKeywords = PtuValidationService.validateKeywords(keywords);

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
        PtuValidationService.validateBasedOn(basedOnMoveName);

        return await PtuMovePseudoCache.update({ id: move.id }, {
            basedOn: basedOnMoveName,
        }, userId);
    }
}
