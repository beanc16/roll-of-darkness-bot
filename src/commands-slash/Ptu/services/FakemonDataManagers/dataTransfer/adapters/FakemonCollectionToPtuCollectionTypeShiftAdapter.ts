/* eslint-disable class-methods-use-this */

import { Adapter } from '../../../../../../services/DataTransfer/Adapter.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';

export type FakemonCollectionToPtuCollectionTypeShiftAdapterOutput = NonNullable<PtuPokemonCollection['typeShifts']>[number];

export class FakemonCollectionToPtuCollectionTypeShiftAdapter extends Adapter<PtuFakemonCollection, FakemonCollectionToPtuCollectionTypeShiftAdapterOutput>
{
    public transform(input: PtuFakemonCollection): FakemonCollectionToPtuCollectionTypeShiftAdapterOutput
    {
        return {
            editName: input.name,
            types: input.types,
            baseStats: input.baseStats,
            abilities: input.abilities,
            evolution: input.evolution,
            sizeInformation: input.sizeInformation,
            breedingInformation: input.breedingInformation,
            diets: input.diets,
            habitats: input.habitats,
            capabilities: input.capabilities,
            skills: input.skills,
            moveList: input.moveList,
            metadata: input.metadata,
            megaEvolutions: input.megaEvolutions,
            extras: input.extras,
        };
    }
}
