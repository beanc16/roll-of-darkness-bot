import { Adapter } from '../../../../../../services/DataTransfer/Adapter.js';
import { PtuFakemonCollection, PtuFakemonDexType } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { FakemonDexNumberPrefix, FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';

export class FakemonCollectionToPtuCollectionAdapter extends Adapter<PtuFakemonCollection, PtuPokemonCollection>
{
    private readonly dexTypeToPrefix: Record<PtuFakemonDexType, FakemonDexNumberPrefix> = {
        [PtuFakemonDexType.Eden]: FakemonDexNumberPrefix.Eden,
        [PtuFakemonDexType.EdenParadox]: FakemonDexNumberPrefix.EdenParadox,
        [PtuFakemonDexType.EdenDrained]: FakemonDexNumberPrefix.EdenDrained,
        [PtuFakemonDexType.EdenLegendary]: FakemonDexNumberPrefix.EdenLegendary,
    };

    public async transform(input: PtuFakemonCollection, index = 0): Promise<PtuPokemonCollection>
    {
        // Get the current max dex number
        const prefixToMaxDexNumber = await FakemonGeneralInformationManagerService.getCurrentMaxDexNumbers();
        const dexPrefix = this.dexTypeToPrefix[input.dexType];
        const maxDexNumber = prefixToMaxDexNumber[dexPrefix];

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
                ...input.metadata,
                // Set the dex number as the same category, but 1 more than the current highest
                // Reference the index as well in case this is a bulk transform where writes will be happening concurrently
                dexNumber: `${dexPrefix}${maxDexNumber + index + 1}`,
            },
            extras: input.extras,
            edits: input.edits,
            versionName: 'Original',
        });
    }
}
