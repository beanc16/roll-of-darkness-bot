import {
    PtuCustomMoveArmorClass,
    PtuCustomMoveDamageBase,
    PtuCustomMoveFrequency,
    PtuMoveStatus,
} from '../../../dal/models/PtuMoveCollection.js';
import { createPtuMoveCollectionData } from '../../../fakes/PtuMoveCollection.fakes.js';
import { LookupKeywordStrategy } from '../../../strategies/lookup/LookupKeywordStrategy.js';
import { LookupMoveStrategy } from '../../../strategies/lookup/LookupMoveStrategy.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
} from '../../../types/pokemon.js';
import { PtuKeywordType } from '../../../types/PtuKeyword.js';
import { PtuValidationService } from '../PtuValidationService.js';

jest.mock('../../../strategies/lookup/LookupMoveStrategy', () =>
{
    return {
        LookupMoveStrategy: {
            getLookupData: jest.fn(),
        },
    };
});

jest.mock('../../../strategies/lookup/LookupKeywordStrategy', () =>
{
    return {
        LookupKeywordStrategy: {
            getLookupData: jest.fn(),
        },
    };
});

describe(`class: ${PtuValidationService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${PtuValidationService.initialize.name}`, () =>
    {
        beforeEach(() =>
        {
            PtuValidationService['allMoveNames'] = new Set<string>();
            PtuValidationService['allKeywordNames'] = new Set<string>();
        });

        it('should call both lookup strategies with includeAllIfNoName: true', async () =>
        {
            // Arrange
            const getMoveLookupDataSpy = jest.spyOn(LookupMoveStrategy, 'getLookupData')
                .mockResolvedValue([]);
            const getKeywordLookupDataSpy = jest.spyOn(LookupKeywordStrategy, 'getLookupData')
                .mockResolvedValue([]);

            // Act
            await PtuValidationService.initialize();

            // Assert
            expect(getMoveLookupDataSpy).toHaveBeenCalledTimes(1);
            expect(getMoveLookupDataSpy).toHaveBeenCalledWith({ includeAllIfNoName: true });
            expect(getKeywordLookupDataSpy).toHaveBeenCalledTimes(1);
            expect(getKeywordLookupDataSpy).toHaveBeenCalledWith({ includeAllIfNoName: true });
        });

        it('should populate allMoveNames from LookupMoveStrategy results', async () =>
        {
            // Arrange
            const moveNames = ['Move1', 'Move2', 'Move3'];
            jest.spyOn(LookupMoveStrategy, 'getLookupData')
                .mockResolvedValue(moveNames.map((name) => ({ name })));
            jest.spyOn(LookupKeywordStrategy, 'getLookupData')
                .mockResolvedValue([]);

            // Act
            await PtuValidationService.initialize();

            // Assert
            expect(PtuValidationService['allMoveNames']).toEqual(new Set(moveNames));
        });

        it('should populate allKeywordNames with only Move type keywords', async () =>
        {
            // Arrange
            jest.spyOn(LookupMoveStrategy, 'getLookupData')
                .mockResolvedValue([]);
            jest.spyOn(LookupKeywordStrategy, 'getLookupData')
                .mockResolvedValue([
                    { name: 'MoveKeyword1', type: PtuKeywordType.Move },
                    { name: 'MoveKeyword2', type: PtuKeywordType.Move },
                    { name: 'NonMoveKeyword', type: 'NotMove' as PtuKeywordType },
                ]);

            // Act
            await PtuValidationService.initialize();

            // Assert
            expect(PtuValidationService['allKeywordNames']).toEqual(new Set(['MoveKeyword1', 'MoveKeyword2']));
        });

        it.each([
            ...PtuValidationService['keywordNameBlacklist'],
        ])('should exclude blacklisted keyword name %s even when type is Move', async (blacklistedName) =>
        {
            // Arrange
            jest.spyOn(LookupMoveStrategy, 'getLookupData')
                .mockResolvedValue([]);
            jest.spyOn(LookupKeywordStrategy, 'getLookupData')
                .mockResolvedValue([
                    { name: blacklistedName, type: PtuKeywordType.Move },
                    { name: 'ValidKeyword', type: PtuKeywordType.Move },
                ]);

            // Act
            await PtuValidationService.initialize();

            // Assert
            expect(PtuValidationService['allKeywordNames']).toEqual(new Set(['ValidKeyword']));
        });
    });

    describe(`method: ${PtuValidationService.validate.name}`, () =>
    {
        const requiredValidations = [
            ['validateName', 'name'],
            ['validateStatus', 'status'],
            ['validateIsTransferred', 'isTransferred'],
            ['validateType', 'type'],
            ['validateCategory', 'category'],
            ['validateFrequency', 'frequency'],
            ['validateDamageBase', 'damageBase'],
            ['validateArmorClass', 'ac'],
            ['validateKeywords', 'keywords'],
        ] as const;

        const optionalValidations = [
            ['validateContestStatEffect', 'contestStatEffect'],
            ['validateContestStatType', 'contestStatType'],
            ['validateBasedOn', 'basedOn'],
            ['validateEffects', 'effects'],
        ] as const;

        let input: ReturnType<typeof createPtuMoveCollectionData>;
        let spies: Record<string, jest.SpyInstance>;

        beforeEach(() =>
        {
            input = createPtuMoveCollectionData();
            spies = {};

            [...requiredValidations, ...optionalValidations].forEach(([methodName]) =>
            {
                spies[methodName] = jest.spyOn(PtuValidationService, methodName)
                    .mockImplementation(() => undefined as never);
            });
        });

        afterEach(() =>
        {
            jest.restoreAllMocks();
        });

        describe.each([true, false])('allowSpecificOptionalFields: %s', (allowSpecificOptionalFields) =>
        {
            beforeEach(() =>
            {
                PtuValidationService.validate(input, { allowSpecificOptionalFields });
            });

            it.each(requiredValidations)('should always call %s with input.%s', (methodName, field) =>
            {
                // Assert
                expect(spies[methodName]).toHaveBeenCalledTimes(1);
                expect(spies[methodName]).toHaveBeenCalledWith(input[field]);
            });

            it.each(optionalValidations)('should call %s with input.%s only when allowSpecificOptionalFields is false', (methodName, field) =>
            {
                // Assert
                if (allowSpecificOptionalFields)
                {
                    /* eslint-disable-next-line jest/no-conditional-expect */
                    expect(spies[methodName]).not.toHaveBeenCalled();
                }
                else
                {
                    /* eslint-disable-next-line jest/no-conditional-expect */
                    expect(spies[methodName]).toHaveBeenCalledTimes(1);
                    /* eslint-disable-next-line jest/no-conditional-expect */
                    expect(spies[methodName]).toHaveBeenCalledWith(input[field]);
                }
            });
        });
    });

    describe(`method: ${PtuValidationService.validateName.name}`, () =>
    {
        it('should not throw for a valid name', () =>
        {
            expect(() => PtuValidationService.validateName('Tackle')).not.toThrow();
        });

        it('should throw an error if name is undefined', () =>
        {
            expect(() => PtuValidationService.validateName(undefined)).toThrow('Move name cannot be empty');
        });

        it('should throw an error if name is empty', () =>
        {
            expect(() => PtuValidationService.validateName('')).toThrow('Move name cannot be empty');
        });

        it('should throw an error if name is only whitespace', () =>
        {
            expect(() => PtuValidationService.validateName('   ')).toThrow('Move name cannot be empty');
        });
    });

    describe(`method: ${PtuValidationService.validateStatus.name}`, () =>
    {
        it.each(
            Object.values(PtuMoveStatus),
        )('should not throw for valid status %s', (status) =>
        {
            expect(() => PtuValidationService.validateStatus(status)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'InvalidStatus'],
        ])('should throw an error if status is %s', (_, status) =>
        {
            expect(() => PtuValidationService.validateStatus(status as PtuMoveStatus))
                .toThrow(`Invalid status: ${status}`);
        });
    });

    describe(`method: ${PtuValidationService.validateIsTransferred.name}`, () =>
    {
        it.each([true, false])('should not throw for boolean value %s', (isTransferred) =>
        {
            expect(() => PtuValidationService.validateIsTransferred(isTransferred)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['string', 'true'],
            ['number', 1],
            ['null', null],
        ])('should throw an error if isTransferred is %s', (_, isTransferred) =>
        {
            expect(() => PtuValidationService.validateIsTransferred(isTransferred as unknown as boolean))
                .toThrow('isTransferred must be a boolean');
        });
    });

    describe(`method: ${PtuValidationService.validateType.name}`, () =>
    {
        it.each(
            Object.values(PokemonType),
        )('should not throw for valid type %s', (type) =>
        {
            expect(() => PtuValidationService.validateType(type)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'INVALID'],
        ])('should throw an error if type is %s', (_, type) =>
        {
            expect(() => PtuValidationService.validateType(type as PokemonType))
                .toThrow(`Invalid type: ${type}`);
        });
    });

    describe(`method: ${PtuValidationService.validateCategory.name}`, () =>
    {
        it.each(
            Object.values(PokemonMoveCategory),
        )('should not throw for valid category %s', (category) =>
        {
            expect(() => PtuValidationService.validateCategory(category)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'INVALID'],
        ])('should throw an error if category is %s', (_, category) =>
        {
            expect(() => PtuValidationService.validateCategory(category as PokemonMoveCategory))
                .toThrow(`Invalid category: ${category}`);
        });
    });

    describe(`method: ${PtuValidationService.validateFrequency.name}`, () =>
    {
        it.each(
            Object.values(PtuCustomMoveFrequency),
        )('should not throw for valid frequency %s', (frequency) =>
        {
            expect(() => PtuValidationService.validateFrequency(frequency)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'INVALID'],
        ])('should throw an error if frequency is %s', (_, frequency) =>
        {
            expect(() => PtuValidationService.validateFrequency(frequency as PtuCustomMoveFrequency))
                .toThrow(`Invalid frequency: ${frequency}`);
        });
    });

    describe(`method: ${PtuValidationService.validateDamageBase.name}`, () =>
    {
        it.each(
            Object.values(PtuCustomMoveDamageBase),
        )('should not throw for valid damage base %s', (damageBase) =>
        {
            expect(() => PtuValidationService.validateDamageBase(damageBase)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'INVALID'],
        ])('should throw an error if damage base is %s', (_, damageBase) =>
        {
            expect(() => PtuValidationService.validateDamageBase(damageBase as PtuCustomMoveDamageBase))
                .toThrow(`Invalid damageBase: ${damageBase}`);
        });
    });

    describe(`method: ${PtuValidationService.validateArmorClass.name}`, () =>
    {
        it.each(
            Object.values(PtuCustomMoveArmorClass),
        )('should not throw for valid armor class %s', (ac) =>
        {
            expect(() => PtuValidationService.validateArmorClass(ac)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'INVALID'],
        ])('should throw an error if armor class is %s', (_, ac) =>
        {
            expect(() => PtuValidationService.validateArmorClass(ac as PtuCustomMoveArmorClass))
                .toThrow(`Invalid ac: ${ac}`);
        });
    });

    describe(`method: ${PtuValidationService.validateContestStatEffect.name}`, () =>
    {
        it.each(
            Object.values(PtuContestStatEffect),
        )('should not throw for valid contest stat effect %s', (contestStatEffect) =>
        {
            expect(() => PtuValidationService.validateContestStatEffect(contestStatEffect)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'INVALID'],
        ])('should throw an error if contest stat effect is %s', (_, contestStatEffect) =>
        {
            expect(() => PtuValidationService.validateContestStatEffect(contestStatEffect as PtuContestStatEffect))
                .toThrow(`Invalid contest stat effect: ${contestStatEffect}`);
        });
    });

    describe(`method: ${PtuValidationService.validateContestStatType.name}`, () =>
    {
        it.each(
            Object.values(PtuContestStatType),
        )('should not throw for valid contest stat type %s', (contestStatType) =>
        {
            expect(() => PtuValidationService.validateContestStatType(contestStatType)).not.toThrow();
        });

        it.each([
            ['undefined', undefined],
            ['invalid', 'INVALID'],
        ])('should throw an error if contest stat type is %s', (_, contestStatType) =>
        {
            expect(() => PtuValidationService.validateContestStatType(contestStatType as PtuContestStatType))
                .toThrow(`Invalid contest stat type: ${contestStatType}`);
        });
    });

    describe(`method: ${PtuValidationService.validateKeywords.name}`, () =>
    {
        beforeEach(() =>
        {
            PtuValidationService['allKeywordNames'] = new Set<string>();
        });

        it('should return an empty array when keywords is undefined', () =>
        {
            // Act
            const result = PtuValidationService.validateKeywords(undefined);

            // Assert
            expect(result).toEqual([]);
        });

        it.each([
            ['1 keyword', ['Keyword1']],
            ['2 keywords', ['Keyword1', 'Keyword2']],
            ['3 keywords', ['Keyword1', 'Keyword2', 'Keyword3']],
            ['4 keywords', ['Keyword1', 'Keyword2', 'Keyword3', 'Keyword4']],
        ])('should return the trimmed keywords for %s', (_, keywords) =>
        {
            // Arrange
            PtuValidationService['allKeywordNames'] = new Set(keywords);

            // Act
            const result = PtuValidationService.validateKeywords(keywords as [string?, string?, string?, string?]);

            // Assert
            expect(result).toEqual(keywords);
        });

        it('should trim whitespace from keywords before returning', () =>
        {
            // Arrange
            const keywords = ['  Keyword1  ', ' Keyword2'] as [string?, string?, string?, string?];
            const trimmedKeywords = ['Keyword1', 'Keyword2'];
            PtuValidationService['allKeywordNames'] = new Set(trimmedKeywords);

            // Act
            const result = PtuValidationService.validateKeywords(keywords);

            // Assert
            expect(result).toEqual(trimmedKeywords);
        });

        it.each([
            ['undefined present', ['Keyword1', undefined]],
            ['empty string present', ['Keyword1', '']],
            ['whitespace present', ['Keyword1', '   ']],
        ])('should throw an error if keywords contains %s', (_, keywords) =>
        {
            expect(() => PtuValidationService.validateKeywords(keywords as [string?, string?, string?, string?]))
                .toThrow('Move cannot have empty keywords');
        });

        it('should throw an error if keywords is an empty array', () =>
        {
            expect(() => PtuValidationService.validateKeywords([] as [string?, string?, string?, string?]))
                .toThrow('Move must have 1-4 keywords');
        });

        it('should throw an error if more than 4 keywords are provided', () =>
        {
            // Arrange
            const keywords = ['Keyword1', 'Keyword2', 'Keyword3', 'Keyword4', 'Keyword5'];
            PtuValidationService['allKeywordNames'] = new Set(keywords);

            // Act & Assert
            expect(() => PtuValidationService.validateKeywords(keywords as unknown as [string?, string?, string?, string?]))
                .toThrow('Move must have 1-4 keywords');
        });

        it('should throw an error if any keyword is invalid', () =>
        {
            // Arrange
            const keywords = ['ValidKeyword', 'InvalidKeyword1', 'InvalidKeyword2'] as [string?, string?, string?, string?];
            PtuValidationService['allKeywordNames'] = new Set(['ValidKeyword']);

            // Act & Assert
            expect(() => PtuValidationService.validateKeywords(keywords))
                .toThrow('Invalid keywords: InvalidKeyword1, InvalidKeyword2');
        });
    });

    describe(`method: ${PtuValidationService.validateBasedOn.name}`, () =>
    {
        beforeEach(() =>
        {
            PtuValidationService['allMoveNames'] = new Set<string>();
        });

        it('should throw an error if allMoveNames has not been initialized', () =>
        {
            expect(() => PtuValidationService.validateBasedOn('SomeMove'))
                .toThrow('Move names not initialized');
        });

        it('should not throw if basedOn is undefined and allMoveNames is initialized', () =>
        {
            // Arrange
            PtuValidationService['allMoveNames'] = new Set(['Move1']);

            // Act & Assert
            expect(() => PtuValidationService.validateBasedOn(undefined)).not.toThrow();
        });

        it('should not throw if basedOn matches a known move name', () =>
        {
            // Arrange
            PtuValidationService['allMoveNames'] = new Set(['Move1', 'Move2']);

            // Act & Assert
            expect(() => PtuValidationService.validateBasedOn('Move1')).not.toThrow();
        });

        it('should throw an error if basedOn does not match a known move name', () =>
        {
            // Arrange
            PtuValidationService['allMoveNames'] = new Set(['Move1', 'Move2']);

            // Act & Assert
            expect(() => PtuValidationService.validateBasedOn('UnknownMove'))
                .toThrow('Invalid based on move name: UnknownMove');
        });
    });

    describe(`method: ${PtuValidationService.validateEffects.name}`, () =>
    {
        it('should not throw for valid effects', () =>
        {
            expect(() => PtuValidationService.validateEffects('This move does damage.')).not.toThrow();
        });

        it('should throw an error if effects is undefined', () =>
        {
            expect(() => PtuValidationService.validateEffects(undefined))
                .toThrow('Move effects cannot be empty');
        });

        it('should throw an error if effects is empty', () =>
        {
            expect(() => PtuValidationService.validateEffects(''))
                .toThrow('Move effects cannot be empty');
        });

        it('should throw an error if effects is only whitespace', () =>
        {
            expect(() => PtuValidationService.validateEffects('   '))
                .toThrow('Move effects cannot be empty');
        });
    });
});
