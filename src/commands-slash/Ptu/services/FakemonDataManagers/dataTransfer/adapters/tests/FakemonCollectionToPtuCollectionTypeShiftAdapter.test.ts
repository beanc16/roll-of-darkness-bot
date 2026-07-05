/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { FakemonCollectionToPtuCollectionTypeShiftAdapter } from '../FakemonCollectionToPtuCollectionTypeShiftAdapter.js';

describe(`class: ${FakemonCollectionToPtuCollectionTypeShiftAdapter.name}`, () =>
{
    let adapter: FakemonCollectionToPtuCollectionTypeShiftAdapter;

    beforeEach(() =>
    {
        adapter = new FakemonCollectionToPtuCollectionTypeShiftAdapter();
    });

    describe(`method: ${FakemonCollectionToPtuCollectionTypeShiftAdapter.prototype.transform.name}`, () =>
    {
        it.each(
            Object.values(PtuFakemonDexType),
        )('should transform PtuFakemonCollection to FakemonCollectionToPtuCollectionTypeShiftAdapterOutput with dexType %s', (dexType) =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType });
            fakemon.metadata.dexNumber = undefined;
            fakemon.moveList.zygardeCubeMoves = undefined;

            // Act
            const result = adapter.transform(fakemon);

            // Assert
            expect(result).toBeDefined();
            expect(result).toEqual({
                editName: fakemon.name,
                types: fakemon.types,
                baseStats: fakemon.baseStats,
                abilities: fakemon.abilities,
                evolution: fakemon.evolution,
                sizeInformation: fakemon.sizeInformation,
                breedingInformation: fakemon.breedingInformation,
                diets: fakemon.diets,
                habitats: fakemon.habitats,
                capabilities: fakemon.capabilities,
                skills: fakemon.skills,
                moveList: {
                    levelUp: fakemon.moveList.levelUp,
                    tmHm: fakemon.moveList.tmHm,
                    eggMoves: fakemon.moveList.eggMoves,
                    tutorMoves: fakemon.moveList.tutorMoves,
                    // zygardeCubeMoves should not be set at all
                },
                metadata: fakemon.metadata,
                megaEvolutions: fakemon.megaEvolutions,
                extras: fakemon.extras,
            });
        });
    });
});
