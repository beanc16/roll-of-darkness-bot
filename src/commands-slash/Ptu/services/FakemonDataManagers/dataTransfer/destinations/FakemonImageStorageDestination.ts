/* eslint-disable class-methods-use-this */

import { DataTransferDestination } from '../../../../../../services/DataTransfer/DataTransferDestination.js';
import type { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { HomebrewPokeApi } from '../../../HomebrewPokeApi/HomebrewPokeApi.js';
import { FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';

export class FakemonImageStorageDestination extends DataTransferDestination<string | undefined, PtuFakemonCollection>
{
    public async create(input: string | undefined, source: PtuFakemonCollection): Promise<void>
    {
        // Do not continue if the image has already been transferred
        if (await this.wasTransferred(input, source))
        {
            return;
        }

        this.validateInput(input);

        // Validate that fakemon URL exists
        await HomebrewPokeApi.getFakemonUrl(source.name);

        // Move image from fakemon folder to pokedex folder
        await HomebrewPokeApi.transferFakemonImageToPokemon(source.name);

        // Say that the image has been transferred
        await FakemonGeneralInformationManagerService.updateTransferredTo({
            fakemon: source,
            transferredTo: {
                imageStorage: true,
            },
        });
    }

    protected validateInput(input: string | undefined): asserts input is string
    {
        if (!input)
        {
            throw new Error('Url must be truthy');
        }
    }

    public async wasTransferred(input: string | undefined, source: PtuFakemonCollection): Promise<boolean>
    {
        if (!input)
        {
            return false;
        }

        let url: string;
        try
        {
            url = await HomebrewPokeApi.getPokemonUrl(source.name);
        }
        catch
        {
            return false;
        }

        return url.length > 0 && source.transferredTo.imageStorage;
    }
}
