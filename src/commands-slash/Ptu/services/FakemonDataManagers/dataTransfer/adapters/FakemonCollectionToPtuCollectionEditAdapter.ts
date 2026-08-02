/* eslint-disable class-methods-use-this */

import { Adapter } from '../../../../../../services/DataTransfer/Adapter.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import { PokemonDiffService } from '../../../PokemonDiffService/PokemonDiffService.js';

export type FakemonCollectionToPtuCollectionEditAdapterOutput = { editName: string } & ReturnType<typeof PokemonDiffService.getDifference>;

export class FakemonCollectionToPtuCollectionEditAdapter extends Adapter<PtuFakemonCollection, FakemonCollectionToPtuCollectionEditAdapterOutput>
{
    public async transform(input: PtuFakemonCollection): Promise<FakemonCollectionToPtuCollectionEditAdapterOutput>
    {
        if (!input.editName || input.editName.length === 0)
        {
            throw new Error('Edit name is not set');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is safe based on knowledge of the consumed package
        const { results: untypedResults = [] } = await PokemonController.getAll({ name: input.editOfPokemonName });
        const [baseSpecies] = untypedResults as PtuPokemonCollection[];

        if (!baseSpecies)
        {
            throw new Error(`Pokemon "${input.editOfPokemonName}" was not found`);
        }

        const diff = PokemonDiffService.getDifference({
            originalPokemon: baseSpecies,
            newPokemon: input,
        });

        const {
            name: _name,
            versionName: _versionName,
            olderVersions: _olderVersions,
            metadata: _metadata,
            typeShifts: _typeShifts,
            ...output
        } = diff;

        return { editName: input.editName, ...output };
    }
}
