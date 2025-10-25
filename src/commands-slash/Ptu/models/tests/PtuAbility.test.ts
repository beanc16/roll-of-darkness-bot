import { GetLookupAbilityDataParameters } from '../../types/modelParameters.js';
import { PtuAbility } from '../PtuAbility.js';

describe('class: PtuAbility', () =>
{
    let defaultAbility: PtuAbility;
    const defaultConstructorInput: string[] = [
        'Run Away', // name
        'At-Will',  // frequency
        'effect',   // effect
        'trigger',  // trigger
        'target',   // target
        'keywords', // keywords
        'effect2',  // effect2
    ];

    beforeEach(() =>
    {
        defaultAbility = new PtuAbility(defaultConstructorInput);
    });

    describe('constructor', () =>
    {
        it.each([
            ['', defaultConstructorInput],
            [' with leading and trailing spaces', defaultConstructorInput.map(value => ` ${value} `)],
        ])('should correctly parse valid inputs%s', () =>
        {
            const ability = new PtuAbility(defaultConstructorInput);

            expect(ability.name).toEqual('Run Away');
            expect(ability.frequency).toEqual('At-Will');
            expect(ability.effect).toEqual('effect');
            expect(ability.trigger).toEqual('trigger');
            expect(ability.target).toEqual('target');
            expect(ability.keywords).toEqual('keywords');
            expect(ability.effect2).toEqual('effect2');
        });
    });

    describe('method: IsValidBasedOnInput', () =>
    {
        let defaultInput: GetLookupAbilityDataParameters;

        beforeEach(() =>
        {
            defaultInput = {
                name: 'Run Away',
                frequencySearch: '',
            };
        });

        it('should return true when all parameters match', () =>
        {
            const result = defaultAbility.IsValidBasedOnInput({
                ...defaultInput,
            });

            expect(result).toEqual(true);
        });

        it('should return false if name is invalid', () =>
        {
            const result = defaultAbility.IsValidBasedOnInput({
                ...defaultInput,
                name: 'Guts',
            });

            expect(result).toEqual(false);
        });

        it('should return false if the move frequency is excluded', () =>
        {
            const result = defaultAbility.IsValidBasedOnInput({
                ...defaultInput,
                frequencySearch: 'Invalid Frequency',
            });

            expect(result).toEqual(false);
        });
    });
});
