import { EqualityOption } from '../../../shared/options/shared.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
    PtuMoveFrequency,
} from '../../types/pokemon.js';
import { PtuMove, type PtuMoveIsValidBasedOnInputParameters } from '../PtuMove.js';

describe('class: PtuMove', () =>
{
    let defaultMove: PtuMove;
    let invalidMove: PtuMove;
    const defaultConstructorInput: string[] = [
        'Tackle',                       // name
        '',                             // _typeIcon
        '',                             // _categoryIcon
        '2',                            // untrimmedDamageBase
        'At-Will',                      // untrimmedFrequency
        '2',                            // untrimmedAc
        'Melee',                        // range
        'No additional effects.',       // effects
        'Tough - Steady Performance',   // contestStats
        'Physical',                     // untrimmedCategory
        'Normal',                       // untrimmedType
        'o',                            // sheerForce
        'o',                            // toughClaws
        'o',                            // technician
        'o',                            // reckless
        'o',                            // ironFist
        'o',                            // megaLauncher
        'o',                            // megaLauncherErrata
        'o',                            // punkRock
        'o',                            // strongJaw
        'o',                            // recklessErrata
        'Pound',                        // basedOn
    ];
    const invalidConstructorInput: string[] = [
        '',                         // name
        '',                         // _typeIcon
        '',                         // _categoryIcon
        '--',                       // untrimmedDamageBase
        'InvalidFrequency',         // untrimmedFrequency
        '--',                       // untrimmedAc
        '--',                       // range
        '',                         // effects
        '',                         // contestStats
        'InvalidCategory',          // untrimmedCategory
        'InvalidType',              // untrimmedType
        '',                         // sheerForce
        '',                         // toughClaws
        '',                         // technician
        '',                         // reckless
        '',                         // ironFist
        '',                         // megaLauncher
        '',                         // megaLauncherErrata
        '',                         // punkRock
        '',                         // strongJaw
        '',                         // recklessErrata
        '',                         // basedOn
    ];

    beforeEach(() =>
    {
        defaultMove = new PtuMove(defaultConstructorInput);
        invalidMove = new PtuMove(invalidConstructorInput);
    });

    describe('constructor', () =>
    {
        it.each([
            ['', defaultConstructorInput],
            [' with leading and trailing spaces', defaultConstructorInput.map(value => ` ${value} `)],
        ])('should correctly parse valid inputs%s', () =>
        {
            expect(defaultMove.name).toEqual('Tackle');
            expect(defaultMove.type).toEqual(PokemonType.Normal);
            expect(defaultMove.category).toEqual(PokemonMoveCategory.Physical);
            expect(defaultMove.damageBase).toEqual(2);
            expect(defaultMove.frequency).toEqual(PtuMoveFrequency.AtWill);
            expect(defaultMove.ac).toEqual(2);
            expect(defaultMove.range).toEqual('Melee');
            expect(defaultMove.effects).toEqual('No additional effects.');
            expect(defaultMove.contestStatType).toEqual('Tough');
            expect(defaultMove.contestStatEffect).toEqual('Steady Performance');
            expect(defaultMove.uses.sheerForce).toEqual(true);
            expect(defaultMove.uses.toughClaws).toEqual(true);
            expect(defaultMove.uses.technician).toEqual(true);
            expect(defaultMove.uses.reckless).toEqual(true);
            expect(defaultMove.uses.ironFist).toEqual(true);
            expect(defaultMove.uses.megaLauncher).toEqual(true);
            expect(defaultMove.uses.megaLauncherErrata).toEqual(true);
            expect(defaultMove.uses.punkRock).toEqual(true);
            expect(defaultMove.uses.strongJaw).toEqual(true);
            expect(defaultMove.uses.recklessErrata).toEqual(true);
        });

        it('should set invalid inputs to undefined', () =>
        {
            expect(invalidMove.damageBase).toBeUndefined();
            expect(invalidMove.frequency).toBeUndefined();
            expect(invalidMove.ac).toBeUndefined();
            expect(invalidMove.range).toBeUndefined();
            expect(invalidMove.category).toBeUndefined();
            expect(invalidMove.type).toBeUndefined();
            expect(invalidMove.contestStatType).toBeUndefined();
            expect(invalidMove.contestStatEffect).toBeUndefined();
        });
    });

    describe('method: IsValidBasedOnInput', () =>
    {
        let defaultInput: PtuMoveIsValidBasedOnInputParameters;

        beforeEach(() =>
        {
            defaultInput = {
                names: new Set(['tackle']),
                type: PokemonType.Normal,
                category: PokemonMoveCategory.Physical,
                db: 2,
                dbEquality: EqualityOption.GreaterThanOrEqualTo,
                frequency: PtuMoveFrequency.AtWill,
                ac: 2,
                acEquality: EqualityOption.GreaterThanOrEqualTo,
                contestStatType: PtuContestStatType.Tough,
                contestStatEffect: PtuContestStatEffect.SteadyPerformance,
                nameSearch: '',
                rangeSearch: '',
                effectSearch: '',
                exclude: {
                    names: [],
                    rangeSearch: '',
                    weaponMovesAndManuevers: false,
                },
                sortBy: 'all',
            };
        });

        it('should return true when all parameters match', () =>
        {
            const result = defaultMove.IsValidBasedOnInput({
                ...defaultInput,
            });

            expect(result).toEqual(true);
        });

        it('should return true when all parameters match, but names is empty', () =>
        {
            const result = defaultMove.IsValidBasedOnInput({
                ...defaultInput,
                names: new Set(),
            });

            expect(result).toEqual(true);
        });

        it.each([
            ['names', new Set(['Absorb'])],
            ['type', PokemonType.Grass],
            ['category', PokemonMoveCategory.Special],
            ['frequency', PtuMoveFrequency.EoT],
            ['contestStatType', PtuContestStatType.Smart],
            ['contestStatEffect', PtuContestStatEffect.GoodShow],
            ['rangeSearch', 'invalid range'],
            ['basedOn', 'invalid based on'],
        ])('should return false if %s is invalid', (key, invalidValue) =>
        {
            const result = defaultMove.IsValidBasedOnInput({
                ...defaultInput,
                [key]: invalidValue,
            });

            expect(result).toEqual(false);
        });

        it.each([
            ['type', 10],
            ['category', 9],
            ['frequency', 4],
            ['damageBase', 3],
            ['ac', 5],
            ['range', 6],
            ['contestStatType', 8],
            ['contestStatEffect', 8],
            ['basedOn', 10],
        ])('should return false if %s is undefined', (key, index) =>
        {
            const move = new PtuMove([
                ...defaultConstructorInput.slice(0, index - 1),
                '',
                ...defaultConstructorInput.slice(index + 1),
            ]);
            const result = move.IsValidBasedOnInput({
                ...defaultInput,
                [key]: undefined,
            });

            expect(result).toEqual(false);
        });

        it.each([
            ['contestStatType', 8, PtuContestStatType.Smart],
            ['contestStatEffect', 8, PtuContestStatEffect.GoodShow],
        ])('should return false if %s is undefined but a valid value is being searched for', (key, index, value) =>
        {
            const move = new PtuMove([
                ...defaultConstructorInput.slice(0, index - 1),
                '',
                ...defaultConstructorInput.slice(index + 1),
            ]);
            const result = move.IsValidBasedOnInput({
                ...defaultInput,
                [key]: value,
            });

            expect(result).toEqual(false);
        });

        it('should return false if the move name is excluded', () =>
        {
            const result = defaultMove.IsValidBasedOnInput({
                ...defaultInput,
                exclude: {
                    names: ['Tackle'],
                    rangeSearch: '',
                    weaponMovesAndManuevers: false,
                },
            });

            expect(result).toEqual(false);
        });

        it('should return false if the move range is excluded', () =>
        {
            const result = defaultMove.IsValidBasedOnInput({
                ...defaultInput,
                exclude: {
                    names: [],
                    rangeSearch: 'Melee',
                    weaponMovesAndManuevers: false,
                },
            });

            expect(result).toEqual(false);
        });

        describe.each([
            ['db', 'dbEquality'],
            ['ac', 'acEquality'],
        ])('%s equality', (acOrDbKey, equalityKey) =>
        {
            it.each([
                [EqualityOption.Equal, 3],
                [EqualityOption.GreaterThanOrEqualTo, 3],
                [EqualityOption.GreaterThan, 3],
                [EqualityOption.LessThanOrEqualTo, 1],
                [EqualityOption.LessThan, 1],
                [EqualityOption.NotEqualTo, 2],
            ])('should return false if %s is invalid', (equalityOption, acOrDb) =>
            {
                const result = defaultMove.IsValidBasedOnInput({
                    ...defaultInput,
                    [acOrDbKey]: acOrDb,
                    [equalityKey]: equalityOption,
                });

                expect(result).toEqual(false);
            });
        });
    });
});
