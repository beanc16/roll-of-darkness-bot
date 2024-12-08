import { EqualityOption } from '../../../../src/commands-slash/options/shared.js';
import { PtuMove } from '../../../../src/commands-slash/Ptu/models/PtuMove.js';
import { GetLookupMoveDataParameters } from '../../../../src/commands-slash/Ptu/types/modelParameters.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuMoveFrequency,
} from '../../../../src/commands-slash/Ptu/types/pokemon.js';

// We don't want to log anything during these tests that would normally log
jest.mock('@beanc16/logger');

describe('class: PtuMove', () =>
{
    let defaultMove: PtuMove;
    const defaultConstructorInput: string[] = [
        'Tackle',                   // name
        '',                         // _typeIcon
        '',                         // _categoryIcon
        '2',                        // untrimmedDamageBase
        'At-Will',                  // untrimmedFrequency
        '2',                        // untrimmedAc
        'Melee',                    // range
        'No additional effects.',   // effects
        'contest',                  // contestStats
        'Physical',                 // untrimmedCategory
        'Normal',                   // untrimmedType
        'o',                        // sheerForce
        'o',                        // toughClaws
        'o',                        // technician
        'o',                        // reckless
        'o',                        // ironFist
        'o',                        // megaLauncher
        'o',                        // megaLauncherErrata
        'o',                        // punkRock
        'o',                        // strongJaw
        'o',                        // recklessErrata
    ];

    beforeEach(() =>
    {
        defaultMove = new PtuMove(defaultConstructorInput);
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
            expect(defaultMove.contestStats).toEqual('contest');
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
            const input = [
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
            ];

            const move = new PtuMove(input);

            expect(move.damageBase).toBeUndefined();
            expect(move.frequency).toBeUndefined();
            expect(move.ac).toBeUndefined();
            expect(move.range).toBeUndefined();
            expect(move.category).toBeUndefined();
            expect(move.type).toBeUndefined();
        });
    });

    describe('method: IsValidBasedOnInput', () =>
    {
        let defaultInput: GetLookupMoveDataParameters;

        beforeEach(() =>
        {
            defaultInput = {
                name: 'Tackle',
                type: PokemonType.Normal,
                category: PokemonMoveCategory.Physical,
                db: 2,
                dbEquality: EqualityOption.GreaterThanOrEqualTo,
                frequency: PtuMoveFrequency.AtWill,
                ac: 2,
                acEquality: EqualityOption.GreaterThanOrEqualTo,
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

        it.each([
            ['name', 'Ember'],
            ['type', PokemonType.Fire],
            ['category', PokemonMoveCategory.Special],
            ['frequency', PtuMoveFrequency.EoT],
            ['rangeSearch', 'invalid range'],
        ])('should return false if %s is invalid', (key, invalidValue) =>
        {
            const result = defaultMove.IsValidBasedOnInput({
                ...defaultInput,
                [key]: invalidValue,
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
