/* eslint-disable class-methods-use-this */

import { ObjectId } from 'mongodb';

import { DataTransferDestination } from '../../../../../../services/DataTransfer/DataTransferDestination.js';
import { Timer } from '../../../../../../services/Timer/Timer.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import { FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';
import type { FakemonCollectionToPtuCollectionEditAdapterOutput } from '../adapters/FakemonCollectionToPtuCollectionEditAdapter.js';

export class FakemonDatabaseEditDestination extends DataTransferDestination<FakemonCollectionToPtuCollectionEditAdapterOutput, PtuFakemonCollection>
{
    public async create(input: FakemonCollectionToPtuCollectionEditAdapterOutput, source: PtuFakemonCollection): Promise<void>
    {
        // Do not continue if the fakemon has already been transferred
        if (await this.wasTransferred(input, source))
        {
            return;
        }

        if (!source.editName)
        {
            throw new Error('Edit name is not set for fakemon');
        }

        if (!source.editOfPokemonName)
        {
            throw new Error('Edit of pokemon name is not set for fakemon');
        }

        // Confirm that the pokemon the edit is of exists
        const { results: [baseSpecies] = [] } = await PokemonController.getAll({ name: source.editOfPokemonName }) as {
            results: PtuPokemonCollection[];
        };

        if (!baseSpecies)
        {
            throw new Error(`Pokemon "${source.editOfPokemonName}" does not exist`);
        }

        this.validateInput(input, baseSpecies);

        // Wait briefly to avoid database error from re-querying too quickly (bug with mongodb-controller connection handling)
        await Timer.wait({ seconds: 0.15 });

        // Append type shift to the pokemon's list of type shifts
        await PokemonController.findOneAndUpdate({ name: source.editOfPokemonName }, {
            edits: [
                ...(baseSpecies.edits ?? []),
                input,
            ],
        });

        // Wait briefly to avoid database error from re-querying too quickly (bug with mongodb-controller connection handling)
        await Timer.wait({ seconds: 0.15 });

        // Mark the fakemon as transferred
        await FakemonGeneralInformationManagerService.updateTransferredTo({
            fakemon: source,
            transferredTo: {
                ptuDatabase: true,
            },
        });
    }

    protected validateInput(
        input: FakemonCollectionToPtuCollectionEditAdapterOutput,
        baseSpecies: PtuPokemonCollection,
    ): asserts input is FakemonCollectionToPtuCollectionEditAdapterOutput
    {
        const ptuPokemonSpecies = baseSpecies.toPtuPokemon();
        PtuPokemonCollection.validate({
            _id: new ObjectId(),
            name: input.editName,
            types: input.types ?? ptuPokemonSpecies.types,
            baseStats: input.baseStats ?? ptuPokemonSpecies.baseStats,
            abilities: input.abilities ?? ptuPokemonSpecies.abilities,
            evolution: input.evolution ?? ptuPokemonSpecies.evolution,
            sizeInformation: input.sizeInformation ?? ptuPokemonSpecies.sizeInformation,
            breedingInformation: input.breedingInformation ?? ptuPokemonSpecies.breedingInformation,
            diets: input.diets ?? ptuPokemonSpecies.diets,
            habitats: input.habitats ?? ptuPokemonSpecies.habitats,
            capabilities: input.capabilities ?? ptuPokemonSpecies.capabilities,
            skills: input.skills ?? ptuPokemonSpecies.skills,
            moveList: input.moveList ?? ptuPokemonSpecies.moveList,
            megaEvolutions: input.megaEvolutions ?? ptuPokemonSpecies.megaEvolutions,
            metadata: ptuPokemonSpecies.metadata,
            extras: input.extras ?? ptuPokemonSpecies.extras,
        });
    }

    public async wasTransferred(_input: FakemonCollectionToPtuCollectionEditAdapterOutput, source: PtuFakemonCollection): Promise<boolean>
    {
        const { results = [] } = await PokemonController.getAll({
            edits: { $elemMatch: { editName: source.editName } },
        }) as { results: PtuPokemonCollection[] };

        return results.length > 0 && source.transferredTo.ptuDatabase;
    }
}
