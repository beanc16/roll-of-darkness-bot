/* eslint-disable class-methods-use-this */

import { ObjectId } from 'mongodb';

import { DataTransferDestination } from '../../../../../../services/DataTransfer/DataTransferDestination.js';
import { Timer } from '../../../../../../services/Timer/Timer.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import { FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';
import type { FakemonCollectionToPtuCollectionTypeShiftAdapterOutput } from '../adapters/FakemonCollectionToPtuCollectionTypeShiftAdapter.js';

export class FakemonDatabaseTypeShiftDestination extends DataTransferDestination<FakemonCollectionToPtuCollectionTypeShiftAdapterOutput, PtuFakemonCollection>
{
    public async create(input: FakemonCollectionToPtuCollectionTypeShiftAdapterOutput, source: PtuFakemonCollection): Promise<void>
    {
        // Do not continue if the fakemon has already been transferred
        if (await this.wasTransferred(input, source))
        {
            return;
        }

        if (!source.typeShiftOfPokemonName)
        {
            throw new Error('Name of Pokemon that fakemon is a type shift of is not set');
        }

        // Confirm that the pokemon the type shift is based on exists
        const { results: [pokemon] = [] } = await PokemonController.getAll({ name: source.typeShiftOfPokemonName }) as {
            results: PtuPokemonCollection[];
        };

        if (!pokemon)
        {
            throw new Error(`Pokemon "${source.typeShiftOfPokemonName}" does not exist`);
        }

        this.validateInput({
            ...input,
            metadata: {
                // Need this or the validation will fail
                dexNumber: pokemon.metadata.dexNumber,
                ...input.metadata!,
            },
        });

        // Wait briefly to avoid database error from re-querying too quickly (bug with mongodb-controller connection handling)
        await Timer.wait({ seconds: 0.15 });

        // Append type shift to the pokemon's list of type shifts
        await PokemonController.findOneAndUpdate({ name: source.typeShiftOfPokemonName }, {
            typeShifts: [
                ...(pokemon.typeShifts ?? []),
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

    protected validateInput(input: FakemonCollectionToPtuCollectionTypeShiftAdapterOutput): asserts input is FakemonCollectionToPtuCollectionTypeShiftAdapterOutput
    {
        PtuPokemonCollection.validate({
            _id: new ObjectId(),
            name: input.editName,
            types: input.types ?? [/* Invalid */],
            baseStats: input.baseStats ?? {
                /* Invalid */
                hp: -1,
                attack: -1,
                defense: -1,
                specialAttack: -1,
                specialDefense: -1,
                speed: -1,
            },
            abilities: input.abilities ?? {
                /* Invalid */
                basicAbilities: [],
                advancedAbilities: [],
                highAbility: '',
            },
            evolution: input.evolution ?? [/* Invalid */],
            sizeInformation: input.sizeInformation ?? {
                /* Invalid */
                height: {
                    freedom: '', metric: '', ptu: '',
                },
                weight: {
                    freedom: '', metric: '', ptu: -1,
                },
            },
            breedingInformation: input.breedingInformation ?? {
                /* Invalid */
                eggGroups: [],
                genderRatio: {},
                averageHatchRate: '',
            },
            diets: input.diets ?? [/* Invalid */],
            habitats: input.habitats ?? [/* Invalid */],
            capabilities: input.capabilities ?? {
                /* Invalid */
                overland: -1,
                swim: -1,
                sky: -1,
                levitate: -1,
                burrow: -1,
                highJump: -1,
                lowJump: -1,
                power: -1,
            },
            skills: input.skills ?? {
                /* Invalid */
                acrobatics: '',
                athletics: '',
                combat: '',
                focus: '',
                perception: '',
                stealth: '',
            },
            moveList: input.moveList ?? {
                /* Invalid */
                levelUp: [],
                tmHm: [''],
                eggMoves: [''],
                tutorMoves: [''],
            },
            megaEvolutions: input.megaEvolutions ?? [/* Invalid */],
            metadata: input.metadata ?? { /* Invalid */ source: '' },
            extras: input.extras ?? [/* Invalid */],
        });
    }

    public async wasTransferred(input: FakemonCollectionToPtuCollectionTypeShiftAdapterOutput, source: PtuFakemonCollection): Promise<boolean>
    {
        const { results = [] } = await PokemonController.getAll({
            typeShifts: { $elemMatch: { editName: input.editName } },
        }) as { results: PtuPokemonCollection[] };

        return results.length > 0 && source.transferredTo.ptuDatabase;
    }
}
