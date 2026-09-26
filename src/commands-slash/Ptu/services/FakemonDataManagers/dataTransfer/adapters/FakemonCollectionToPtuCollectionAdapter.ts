/* eslint-disable class-methods-use-this */

import { Adapter } from '../../../../../../services/DataTransfer/Adapter.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';
import { dexTypeAndDexNumberToDexEntry, dexTypeToPrefix } from '../../fakemonUtils.js';

export class FakemonCollectionToPtuCollectionAdapter extends Adapter<PtuFakemonCollection, PtuPokemonCollection>
{
    public async transform(input: PtuFakemonCollection, index = 0): Promise<PtuPokemonCollection>
    {
        let dexNumber = input.metadata?.dexNumber;
        const {
            imageUrl: _,
            ...metadata
        } = input.metadata;

        // If dex number is not yet set:
        // Set the dex number as the same category, but one more than the current highest
        // Reference the index as well in case this is a bulk transform where writes will be happening concurrently
        if (!dexNumber)
        {
            const { maxDexNumber } = await FakemonCollectionToPtuCollectionAdapter.getMaxDexNumber(input.dexType);
            dexNumber = dexTypeAndDexNumberToDexEntry(input.dexType, maxDexNumber + index + 1);
        }

        return new PtuPokemonCollection({
            _id: input.id,
            name: input.name,
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
            megaEvolutions: input.megaEvolutions,
            metadata: {
                ...metadata,
                dexNumber,
            },
            extras: input.extras,
            edits: input.edits,
            versionName: 'Original',
            typeShifts: [],
        });
    }

    public static async getMaxDexNumber(dexType: PtuFakemonCollection['dexType']): Promise<{ maxDexNumber: number }>
    {
        // Get the current max dex number
        const prefixToMaxDexNumber = await FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers();
        const dexPrefix = dexTypeToPrefix[dexType];
        const maxDexNumber = prefixToMaxDexNumber[dexPrefix];

        return { maxDexNumber };
    }
}
