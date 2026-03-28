/* eslint-disable class-methods-use-this */

import { DataTransferDestination } from '../../../../../../services/DataTransfer/DataTransferDestination.js';
import { Timer } from '../../../../../../services/Timer/Timer.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import { FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';

export class FakemonDatabaseDestination extends DataTransferDestination<PtuPokemonCollection, PtuFakemonCollection>
{
    public async create(input: PtuPokemonCollection, source: PtuFakemonCollection): Promise<void>
    {
        // Do not continue if the fakemon has already been transferred
        if (await this.wasTransferred(input, source))
        {
            return;
        }

        this.validateInput(input);

        // Insert only if another pokemon with id and this name does not exist already
        await PokemonController.insertOneIfNotExists({
            // eslint-disable-next-line no-underscore-dangle
            $or: [{ _id: input._id }, { name: input.name }],
        }, input);

        // Wait briefly to avoid database error from re-querying to quickly (bug with mongodb-controller connection handling)
        await Timer.wait({ seconds: 0.15 });

        // Say that the fakemon has been transferred
        await FakemonGeneralInformationManagerService.updateTransferredTo({
            fakemon: source,
            transferredTo: {
                ptuDatabase: true,
            },
        });
    }

    protected validateInput(input: PtuPokemonCollection): asserts input is PtuPokemonCollection
    {
        PtuPokemonCollection.validate(input);
    }

    public async wasTransferred(input: PtuPokemonCollection, source: PtuFakemonCollection): Promise<boolean>
    {
        const { results = [] } = await PokemonController.getAll({
            // eslint-disable-next-line no-underscore-dangle
            $or: [{ _id: input._id }, { name: input.name }],
        }) as { results: PtuPokemonCollection[] };

        return results.length > 0 && source.transferredTo.ptuDatabase;
    }
}
