import { ObjectId } from 'mongodb';

import { PtuPokemon } from '../../types/pokemon.js';

// TODO: Move this to a dedicated API for roll of darkness to call later instead
interface PtuPokemonEdit extends Partial<Omit<PtuPokemon, 'name' | 'olderVersions'>>
{
    editName: string;
}

export class PtuPokemonCollection
{
    public _id: ObjectId;
    public name: PtuPokemon['name'];
    public types: PtuPokemon['types'];
    public baseStats: PtuPokemon['baseStats'];
    public abilities: PtuPokemon['abilities'];
    public evolution: PtuPokemon['evolution'];
    public sizeInformation: PtuPokemon['sizeInformation'];
    public breedingInformation: PtuPokemon['breedingInformation'];
    public diets: PtuPokemon['diets'];
    public habitats: PtuPokemon['habitats'];
    public capabilities: PtuPokemon['capabilities'];
    public skills: PtuPokemon['skills'];
    public moveList: PtuPokemon['moveList'];
    public megaEvolutions: PtuPokemon['megaEvolutions'];
    public metadata: PtuPokemon['metadata'];
    public extras: PtuPokemon['extras'];
    public edits?: PtuPokemonEdit[];

    constructor({
        _id,
        name,
        types,
        baseStats,
        abilities,
        evolution,
        sizeInformation,
        breedingInformation,
        diets,
        habitats,
        capabilities,
        skills,
        moveList,
        megaEvolutions,
        metadata,
        extras,
        edits,
    }: PtuPokemon & { _id: ObjectId; edits: PtuPokemonEdit[] })
    {
        if (_id)
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = _id;
        }
        else
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = new ObjectId();
        }

        this.name = name;
        this.types = types;
        this.baseStats = baseStats;
        this.abilities = abilities;
        this.evolution = evolution;
        this.sizeInformation = sizeInformation;
        this.breedingInformation = breedingInformation;
        this.diets = diets;
        this.habitats = habitats;
        this.capabilities = capabilities;
        this.skills = skills;
        this.moveList = moveList;
        this.megaEvolutions = megaEvolutions;
        this.metadata = metadata;
        this.extras = extras;
        this.edits = edits;
    }

    public toPtuPokemon(): PtuPokemon
    {
        // Data setup
        const {
            _id,
            edits,
            ...originalPokemonData
        } = this;
        const originalPokemon: PtuPokemon = { ...originalPokemonData, versionName: 'Original' };
        const {
            name: _name,
            ...originalPokemonDataWithoutName
        } = originalPokemonData;

        // Get most recent & remaining edits
        const editsReversed = edits?.toReversed() ?? [];
        const [mostRecentEdit, ...remainingEdits] = editsReversed;

        // Create output that has all possible edits
        let output: PtuPokemon = {
            ...originalPokemon,
            ...(mostRecentEdit
                ? PtuPokemonCollection.toPtuPokemonEdit(originalPokemon, mostRecentEdit)
                : {}
            ),
        };

        // Update output with remaining edits so it has the most up-to-date data
        remainingEdits?.forEach((edit) =>
        {
            output = {
                name: output.name,
                ...PtuPokemonCollection.toPtuPokemonEdit(output, edit),
            };
        });

        // Get older versions
        const olderVersions = remainingEdits?.toReversed().map((edit) =>
            PtuPokemonCollection.toPtuPokemonEdit(output, edit),
        ) ?? [];

        // Add the original data as the "last" edit
        if (edits && edits.length > 0)
        {
            olderVersions.push(
                PtuPokemonCollection.toPtuPokemonEdit(originalPokemon, {
                    editName: 'Original',
                    ...originalPokemonDataWithoutName,
                }),
            );
        }

        if (olderVersions.length > 0)
        {
            output.olderVersions = olderVersions;
        }

        return output;
    }

    private static toPtuPokemonEdit(output: PtuPokemon, edit: PtuPokemonEdit): NonNullable<PtuPokemon['olderVersions']>[0]
    {
        const {
            name: _,
            sizeInformation,
            breedingInformation,
            skills,
            moveList,
            ...outputData
        } = output;

        const {
            editName,
            sizeInformation: editSizeInformation,
            breedingInformation: editBreedingInformation,
            skills: editSkills,
            moveList: editMoveList,
            ...editData
        } = edit;

        return {
            ...outputData,
            ...editData,
            versionName: editName,
            sizeInformation: {
                height: {
                    ...sizeInformation.height,
                    ...(editSizeInformation?.height ?? {}),
                },
                weight: {
                    ...sizeInformation.weight,
                    ...(editSizeInformation?.weight ?? {}),
                },
            },
            breedingInformation: {
                ...breedingInformation,
                ...(editBreedingInformation ?? {}),
                genderRatio: {
                    ...breedingInformation.genderRatio,
                    ...(editBreedingInformation?.genderRatio ?? {}),
                },
            },
            skills: {
                ...skills,
                ...(editSkills ?? {}),
            },
            moveList: {
                ...moveList,
                ...(editMoveList ?? {}),
            },
        };
    }
}
