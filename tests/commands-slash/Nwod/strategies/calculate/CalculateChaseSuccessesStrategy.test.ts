import {
    InitiativeModifier,
    OpponentSpeed,
    Territory,
} from '../../../../../src/commands-slash/Nwod/options/calculate.js';
import { CalculateChaseSuccessesStrategy, type CalculateSuccessesOptions } from '../../../../../src/commands-slash/Nwod/strategies/calculate/CalculateChaseSuccessesStrategy.js';

describe('class: CalculateChaseSuccessesStrategy', () =>
{
    describe('methods: calculateSuccesses', () =>
    {
        let defaultSuccesses: number;
        let defaultOptions: CalculateSuccessesOptions;

        beforeEach(() =>
        {
            defaultSuccesses = 5;
            defaultOptions = {
                opponentsSpeed: OpponentSpeed.NoneOfTheAbove,
                initiativeModifier: InitiativeModifier.NoneOfTheAbove,
                territory: Territory.DoesntKnow,
                opponentsTurnLead: 0,
                sizeIsLowerThanOpponents: false,
                opponentCannotBeTired: false,
                environmentDangerModifier: 0,
            };
        });

        it('should calculate the correct number of successes with default values', () =>
        {
            const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                ...defaultOptions,
            });

            expect(result).toEqual(defaultSuccesses);
        });

        it(`should calculate the correct number of successes when your size is lower than your opponent's`, () =>
        {
            const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                ...defaultOptions,
                sizeIsLowerThanOpponents: true,
            });

            expect(result).toEqual(defaultSuccesses - 1);
        });

        it('should calculate the correct number of successes when your opponent cannot be tired', () =>
        {
            const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                ...defaultOptions,
                opponentCannotBeTired: true,
            });

            expect(result).toEqual(defaultSuccesses + 2);
        });

        it('should calculate the correct number of successes with all positive modifiers', () =>
        {
            const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                opponentsSpeed: OpponentSpeed.TenTimesYours,
                initiativeModifier: InitiativeModifier.NoneOfTheAbove,
                territory: Territory.DoesntKnow,
                opponentsTurnLead: 2,
                sizeIsLowerThanOpponents: false,
                opponentCannotBeTired: true,
                environmentDangerModifier: 3,
            });

            expect(result).toBe(5 + 5 + 2 + 2 + 3); // Base + Speed + Turn Lead + Cannot Be Tired + Environment Modifier
        });

        it('should calculate 0 successes if modifiers would make the number of successes negative', () =>
        {
            const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                opponentsSpeed: OpponentSpeed.NoneOfTheAbove,
                initiativeModifier: InitiativeModifier.ThreeTimesOpponents, // Negative
                territory: Territory.KnowsIntimately,                       // Negative
                opponentsTurnLead: 0,
                sizeIsLowerThanOpponents: true,                             // Negative
                opponentCannotBeTired: false,
                environmentDangerModifier: 0,
            });

            expect(result).toEqual(0);
        });

        it('should calculate the correct number of successes with a mix of positive and negative modifiers', () =>
        {
            const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                opponentsSpeed: OpponentSpeed.HigherThanYours,              // Positive
                initiativeModifier: InitiativeModifier.HigherThanOpponents, // Negative
                territory: Territory.Knows,                                 // Negative
                opponentsTurnLead: 1,                                       // Positive
                sizeIsLowerThanOpponents: false,                            // Netural
                opponentCannotBeTired: false,                               // Netural
                environmentDangerModifier: 2,                               // Positive
            });

            expect(result).toBe(5 + 1 - 1 - 1 + 1 + 2); // Base + Speed - Initiative - Territory + Turn Lead + Environment
        });

        describe('OpponentSpeed', () =>
        {
            it.each([
                [OpponentSpeed.HigherThanYours, 1],
                [OpponentSpeed.TwiceYours, 3],
                [OpponentSpeed.TenTimesYours, 5],
            ])(`should calculate the correct number of successes with an opponent's speed that "%s"`, (opponentsSpeed, modifier) =>
            {
                const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    opponentsSpeed,
                });

                expect(result).toEqual(defaultSuccesses + modifier);
            });
        });

        describe('InitiativeModifier', () =>
        {
            it.each([
                [InitiativeModifier.HigherThanOpponents, -1],
                [InitiativeModifier.TwiceOpponents, -2],
                [InitiativeModifier.ThreeTimesOpponents, -3],
            ])(`should calculate the correct number of successes with an initiative modifier that "%s"`, (initiativeModifier, modifier) =>
            {
                const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    initiativeModifier,
                });

                expect(result).toEqual(defaultSuccesses + modifier);
            });
        });

        describe('Territory', () =>
        {
            it.each([
                [Territory.Knows, -1],
                [Territory.KnowsIntimately, -3],
            ])(`should calculate the correct number of successes with a territory knowledge of "%s"`, (territory, modifier) =>
            {
                const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    territory,
                });

                expect(result).toEqual(defaultSuccesses + modifier);
            });
        });

        describe(`OpponentsTurnLead`, () =>
        {
            it.each([
                1,
                2,
            ])(`should calculate the correct number of successes when the opponent has a turn lead of "%s"`, (opponentsTurnLead) =>
            {
                const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    opponentsTurnLead,
                });

                expect(result).toEqual(defaultSuccesses + opponentsTurnLead);
            });
        });

        describe(`EnvironmentDangerModifier`, () =>
        {
            it.each([
                1,
                2,
                3,
            ])(`should calculate the correct number of successes when the environment has a danger modifier of "%s"`, (environmentDangerModifier) =>
            {
                const result = CalculateChaseSuccessesStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    environmentDangerModifier,
                });

                expect(result).toEqual(defaultSuccesses + environmentDangerModifier);
            });
        });
    });
});
