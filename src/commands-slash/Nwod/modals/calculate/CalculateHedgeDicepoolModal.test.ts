import { CalculateHedgeDicepoolModal, ParseInputResponse } from './CalculateHedgeDicepoolModal.js';

describe('class: CalculateHedgeDicepoolModal', () =>
{
    describe('method: calculateHedgesDicepool', () =>
    {
        let defaultSuccesses: number;
        let defaultOptions: ParseInputResponse;

        beforeEach(() =>
        {
            defaultSuccesses = 5;
            defaultOptions = {
                trodRating: 0,
                charactersWithPositiveConditions: 0,
                charactersWithNegativeConditions: 0,
                characterHasHalfOrLowerClarity: false,
                charactersHavePressingTimeLimit: false,
                hedgeHasEdge: false,
                changelingIncitedBedlam: false,
                changelingIncitedBedlamWithExceptionalSuccess: false,
                charactersInThorns: false,
                errorMessages: [],
            };
        });

        it('should calculate the correct number of successes with default values', () =>
        {
            const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                ...defaultOptions,
            });

            expect(result).toEqual(defaultSuccesses);
        });

        it('should calculate the correct number of successes with all positive modifiers', () =>
        {
            const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                ...defaultOptions,
                charactersWithNegativeConditions: 3,
                characterHasHalfOrLowerClarity: true,
                charactersHavePressingTimeLimit: true,
                hedgeHasEdge: true,
                changelingIncitedBedlam: true,
                changelingIncitedBedlamWithExceptionalSuccess: true,
                charactersInThorns: true,
            });

            expect(result).toEqual(defaultSuccesses + 3 + 1 + 2 + 2 + 2 + 3 + 3);
        });

        it('should calculate the correct number of successes with all negative modifiers', () =>
        {
            const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                ...defaultOptions,
                trodRating: 1,
                charactersWithPositiveConditions: 2,
            });

            expect(result).toEqual(defaultSuccesses - 1 - 2);
        });

        it('should calculate 0 successes if modifiers would make the number of successes negative', () =>
        {
            const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                ...defaultOptions,
                trodRating: 10,
                charactersWithPositiveConditions: 5,
            });

            expect(result).toEqual(0);
        });

        describe('TrodRating', () =>
        {
            it.each([
                1,
                2,
                3,
                4,
                5,
            ])(`should calculate the correct number of successes when the trod rating is "%s"`, (trodRating) =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    trodRating,
                });

                expect(result).toEqual(defaultSuccesses - trodRating);
            });
        });

        describe('CharactersWithPositiveConditions', () =>
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
            ])(`should calculate the correct number of successes when the number of characters with positive conditions is "%s"`, (charactersWithPositiveConditions) =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    charactersWithPositiveConditions,
                });

                const expectedResult = (defaultSuccesses - charactersWithPositiveConditions >= 0)
                    ? defaultSuccesses - charactersWithPositiveConditions
                    : 0;
                expect(result).toEqual(expectedResult);
            });
        });

        describe('CharactersWithNegativeConditions', () =>
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
            ])(`should calculate the correct number of successes when the number of characters with negative conditions is "%s"`, (charactersWithNegativeConditions) =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    charactersWithNegativeConditions,
                });

                expect(result).toEqual(defaultSuccesses + charactersWithNegativeConditions);
            });
        });

        describe('CharacterHasHalfOrLowerClarity', () =>
        {
            it(`should calculate the correct number of successes when the character has half or lower clarity`, () =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    characterHasHalfOrLowerClarity: true,
                });

                expect(result).toEqual(defaultSuccesses + 1);
            });
        });

        describe('CharactersHavePressingTimeLimit', () =>
        {
            it(`should calculate the correct number of successes when the characters have a pressing time limit`, () =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    charactersHavePressingTimeLimit: true,
                });

                expect(result).toEqual(defaultSuccesses + 2);
            });
        });

        describe('HedgeHasEdge', () =>
        {
            it(`should calculate the correct number of successes when the hedge has an edge`, () =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    hedgeHasEdge: true,
                });

                expect(result).toEqual(defaultSuccesses + 2);
            });
        });

        describe('ChangelingIncitedBedlam', () =>
        {
            it(`should calculate the correct number of successes when the changeling incited bedlam`, () =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    changelingIncitedBedlam: true,
                });

                expect(result).toEqual(defaultSuccesses + 2);
            });
        });

        describe('ChangelingIncitedBedlamWithExceptionalSuccess', () =>
        {
            it(`should calculate the correct number of successes when the changeling incited bedlam with exceptional success`, () =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    changelingIncitedBedlamWithExceptionalSuccess: true,
                });

                expect(result).toEqual(defaultSuccesses + 3);
            });
        });

        describe('CharactersInThorns', () =>
        {
            it(`should calculate the correct number of successes when the characters are in thorns`, () =>
            {
                const result = CalculateHedgeDicepoolModal['calculateHedgesDicepool']({
                    ...defaultOptions,
                    charactersInThorns: true,
                });

                expect(result).toEqual(defaultSuccesses + 3);
            });
        });
    });
});
