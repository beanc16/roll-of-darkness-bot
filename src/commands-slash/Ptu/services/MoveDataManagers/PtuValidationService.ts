import {
    PtuCustomMoveArmorClass,
    PtuCustomMoveDamageBase,
    PtuCustomMoveFrequency,
    PtuMoveCollection,
    PtuMoveStatus,
} from '../../dal/models/PtuMoveCollection.js';
import { LookupKeywordStrategy } from '../../strategies/lookup/LookupKeywordStrategy.js';
import { LookupMoveStrategy } from '../../strategies/lookup/LookupMoveStrategy.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
} from '../../types/pokemon.js';
import { PtuKeywordType } from '../../types/PtuKeyword.js';

export class PtuValidationService
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

    public static async initialize(): Promise<void>
    {
        // Initialize based on move names
        const allMoves = await LookupMoveStrategy.getLookupData({ includeAllIfNoName: true });
        allMoves.forEach((curMove) => this.allMoveNames.add(curMove.name));

        // Initialize keywords
        const allKeywords = await LookupKeywordStrategy.getLookupData({ includeAllIfNoName: true });
        allKeywords.forEach((keyword) =>
        {
            if (keyword.type === PtuKeywordType.Move && !this.keywordNameBlacklist.has(keyword.name))
            {
                this.allKeywordNames.add(keyword.name);
            }
        });
    }

    /**
     * Validates after this service has been initialized
     */
    public static validate(input: PtuMoveCollection, { allowSpecificOptionalFields }: {
        /**
         * Allows the following fields to remain undefined/optional:
         * - contestStatEffect
         * - contestStatType
         * - basedOn
         * - effects
         */
        allowSpecificOptionalFields: boolean;
    }): asserts input is PtuMoveCollection & {
        status: PtuMoveStatus;
        isTransferred: boolean;
        type: PokemonType;
        category: PokemonMoveCategory;
        frequency: PtuCustomMoveFrequency;
    }
    {
        // Required
        PtuValidationService.validateName(input.name);
        PtuValidationService.validateStatus(input.status);
        PtuValidationService.validateIsTransferred(input.isTransferred);
        PtuValidationService.validateType(input.type);
        PtuValidationService.validateCategory(input.category);
        PtuValidationService.validateFrequency(input.frequency);
        PtuValidationService.validateDamageBase(input.damageBase);
        PtuValidationService.validateArmorClass(input.ac);
        PtuValidationService.validateKeywords(input.keywords);

        // Optional
        if (allowSpecificOptionalFields === false)
        {
            PtuValidationService.validateContestStatEffect(input.contestStatEffect);
            PtuValidationService.validateContestStatType(input.contestStatType);
            PtuValidationService.validateBasedOn(input.basedOn);
            PtuValidationService.validateEffects(input.effects);
        }
    }

    public static validateName(name?: string): asserts name is string
    {
        if (name === undefined || name.trim().length === 0)
        {
            throw new Error('Move name cannot be empty');
        }
    }

    public static validateStatus(status?: PtuMoveStatus): asserts status is PtuMoveStatus
    {
        if (status === undefined || !this.allStatuses.has(status))
        {
            throw new Error(`Invalid status: ${status}`);
        }
    }

    public static validateIsTransferred(isTransferred?: boolean): asserts isTransferred is boolean
    {
        if (typeof isTransferred !== 'boolean')
        {
            throw new Error(`isTransferred must be a boolean`);
        }
    }

    public static validateType(type?: PokemonType): asserts type is PokemonType
    {
        if (type === undefined || !this.allTypes.has(type))
        {
            throw new Error(`Invalid type: ${type}`);
        }
    }

    public static validateCategory(category?: PokemonMoveCategory): asserts category is PokemonMoveCategory
    {
        if (category === undefined || !this.allCategories.has(category))
        {
            throw new Error(`Invalid category: ${category}`);
        }
    }

    public static validateFrequency(frequency?: PtuCustomMoveFrequency): asserts frequency is PtuCustomMoveFrequency
    {
        if (frequency === undefined || !this.allFrequencies.has(frequency))
        {
            throw new Error(`Invalid frequency: ${frequency}`);
        }
    }

    public static validateDamageBase(damageBase?: PtuCustomMoveDamageBase): asserts damageBase is PtuCustomMoveDamageBase
    {
        if (damageBase === undefined || !this.allDamageBases.has(damageBase))
        {
            throw new Error(`Invalid damageBase: ${damageBase}`);
        }
    }

    public static validateArmorClass(ac?: PtuCustomMoveArmorClass): asserts ac is PtuCustomMoveArmorClass
    {
        if (ac === undefined || !this.allAcs.has(ac))
        {
            throw new Error(`Invalid ac: ${ac}`);
        }
    }

    public static validateContestStatEffect(contestStatEffect?: PtuContestStatEffect): asserts contestStatEffect is PtuContestStatEffect
    {
        if (contestStatEffect === undefined || !this.allContestStatEffects.has(contestStatEffect))
        {
            throw new Error(`Invalid contest stat effect: ${contestStatEffect}`);
        }
    }

    public static validateContestStatType(contestStatType?: PtuContestStatType): asserts contestStatType is PtuContestStatType
    {
        if (contestStatType === undefined || !this.allContestStatTypes.has(contestStatType))
        {
            throw new Error(`Invalid contest stat type: ${contestStatType}`);
        }
    }

    public static validateKeywords(keywords?: [string?, string?, string?, string?]): [string?, string?, string?, string?]
    {
        if (keywords === undefined)
        {
            return [];
        }

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

        const invalidKeywords = truthyKeywords.filter((keyword) => keyword && !this.allKeywordNames.has(keyword));
        if (invalidKeywords.length > 0)
        {
            throw new Error(`Invalid keywords: ${invalidKeywords.join(', ')}`);
        }

        return truthyKeywords;
    }

    public static validateBasedOn(basedOn?: string): void
    {
        if (this.allMoveNames.size === 0)
        {
            throw new Error('Move names not initialized');
        }

        if (basedOn !== undefined && !this.allMoveNames.has(basedOn))
        {
            throw new Error(`Invalid based on move name: ${basedOn}`);
        }
    }

    public static validateEffects(effects?: string): asserts effects is string
    {
        if (effects === undefined || effects.trim().length === 0)
        {
            throw new Error('Move effects cannot be empty');
        }
    }
}
