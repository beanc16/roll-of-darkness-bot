import { jest } from '@jest/globals';

import {
    CurrentClarity,
    InitiativeModifier,
    OpponentSpeed,
    Territory,
    TimeLimit,
} from '../../../../../src/commands-slash/Nwod/options/calculate.js';
import { CalculateChaseSuccessesStrategy } from '../../../../../src/commands-slash/Nwod/strategies/calculate/CalculateChaseSuccessesStrategy.js';
import { CalculateHedgeNavigationStrategy, type GetParameterResultsResponse } from '../../../../../src/commands-slash/Nwod/strategies/calculate/CalculateHedgeNavigationStrategy.js';

const mockedCalculateChaseSuccessesStrategy = jest.mock('../../../../../src/commands-slash/Nwod/strategies/calculate/CalculateChaseSuccessesStrategy.js');

describe('class: CalculateHedgeNavigationStrategy', () =>
{
    describe('method: calculateSuccesses', () =>
    {
        let defaultSuccesses: number;
        let defaultOptions: GetParameterResultsResponse;

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
                wyrdRating: 0,
                currentClarity: CurrentClarity.FourOrHigher,
                timeLimit: TimeLimit.NotUrgent,
                goblinDebtAccepted: 0,
                huntsmanModifer: 0,
                trodModifer: 0,
            } as GetParameterResultsResponse;

            mockedCalculateChaseSuccessesStrategy.spyOn(
                CalculateChaseSuccessesStrategy,
                'calculateSuccesses',
            ).mockReturnValue(5);
        });

        it('should calculate the correct number of successes with default values', () =>
        {
            const result = CalculateHedgeNavigationStrategy['calculateSuccesses']({
                ...defaultOptions,
            });

            expect(result).toEqual(defaultSuccesses);
        });

        describe('WyrdRating', () =>
        {
            it.each([
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
            ])(`should calculate the correct number of successes when the wyrd rating has a modifier of "%s"`, (wyrdRating) =>
            {
                const result = CalculateHedgeNavigationStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    wyrdRating,
                });

                const expectedResult = (defaultSuccesses - wyrdRating < 0)
                    ? 0
                    : defaultSuccesses - wyrdRating;
                expect(result).toEqual(expectedResult);
            });
        });

        describe('CurrentClarity', () =>
        {
            it.each([
                [CurrentClarity.Three, 1],
                [CurrentClarity.Two, 2],
                [CurrentClarity.One, 3],
            ])(`should calculate the correct number of successes with a territory knowledge of "%s"`, (currentClarity, modifier) =>
            {
                const result = CalculateHedgeNavigationStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    currentClarity,
                });

                expect(result).toEqual(defaultSuccesses + modifier);
            });
        });

        describe('TimeLimit', () =>
        {
            it.each([
                [TimeLimit.SomewhatUrgent, 1],
                [TimeLimit.MoreUrgent, 2],
                [TimeLimit.MostUrgent, 3],
            ])(`should calculate the correct number of successes with a territory knowledge of "%s"`, (timeLimit, modifier) =>
            {
                const result = CalculateHedgeNavigationStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    timeLimit,
                });

                expect(result).toEqual(defaultSuccesses + modifier);
            });
        });

        describe('GoblinDebtAccepted', () =>
        {
            it.each([
                1,
                2,
                3,
            ])(`should calculate the correct number of successes when the goblin debt accepted is "%s"`, (goblinDebtAccepted) =>
            {
                const result = CalculateHedgeNavigationStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    goblinDebtAccepted,
                });

                expect(result).toEqual(defaultSuccesses - goblinDebtAccepted);
            });
        });

        describe('HuntsmanModifer', () =>
        {
            it.each([
                -1,
                -2,
            ])(`should calculate the correct number of successes with a huntsman modifier of "%s"`, (huntsmanModifer) =>
            {
                const result = CalculateHedgeNavigationStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    huntsmanModifer,
                });

                expect(result).toEqual(defaultSuccesses + huntsmanModifer);
            });
        });

        describe('TrodModifier', () =>
        {
            it.each([
                1,
                2,
                3,
                4,
                5,
            ])(`should calculate the correct number of successes with a trod modifier of "%s"`, (trodModifer) =>
            {
                const result = CalculateHedgeNavigationStrategy['calculateSuccesses']({
                    ...defaultOptions,
                    trodModifer,
                });

                expect(result).toEqual(defaultSuccesses + trodModifer);
            });
        });
    });
});
