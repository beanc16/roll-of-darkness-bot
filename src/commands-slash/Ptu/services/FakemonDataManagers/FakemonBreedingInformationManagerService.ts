import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PokemonEggGroup, PokemonGenderRatio } from '../../types/pokemon.js';

export class FakemonBreedingInformationManagerService
{
    private static allEggGroups = new Set(Object.values(PokemonEggGroup));
    private static allGenderRatios = new Set(Object.values(PokemonGenderRatio));

    public static async setEggGroups({
        messageId,
        fakemon,
        eggGroups,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        eggGroups: PokemonEggGroup[];
    }): Promise<PtuFakemonCollection>
    {
        if (eggGroups.length > 2)
        {
            throw new Error('Fakemon must have 1-2 egg groups');
        }

        const inputEggGroups = eggGroups.length > 0 ? eggGroups : [PokemonEggGroup.None];
        const invalidEggGroups = inputEggGroups.filter((eggGroup) => !this.allEggGroups.has(eggGroup));
        if (invalidEggGroups.length > 0)
        {
            throw new Error(`Invalid egg groups: ${invalidEggGroups.join(', ')}`);
        }

        if (new Set(inputEggGroups).size !== inputEggGroups.length)
        {
            throw new Error('Cannot have duplicate egg groups');
        }

        if (inputEggGroups.length === 2 && inputEggGroups.includes(PokemonEggGroup.None))
        {
            throw new Error(`Fakemon with the ${PokemonEggGroup.None} egg group cannot have a second egg group`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            breedingInformation: {
                ...fakemon.breedingInformation,
                eggGroups: inputEggGroups,
            },
        });
    }

    public static async setGenderRatio({
        messageId,
        fakemon,
        genderRatio,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        genderRatio: PokemonGenderRatio;
    }): Promise<PtuFakemonCollection>
    {
        if (!this.allGenderRatios.has(genderRatio))
        {
            throw new Error(`Invalid gender ratio: ${genderRatio}`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            breedingInformation: {
                ...fakemon.breedingInformation,
                genderRatio: this.adaptGenderRatio(genderRatio),
            },
        });
    }

    private static adaptGenderRatio(genderRatio: PokemonGenderRatio): PtuFakemonCollection['breedingInformation']['genderRatio']
    {
        switch (genderRatio)
        {
            case PokemonGenderRatio.Male50Female50:
                return { male: 50, female: 50 };

            case PokemonGenderRatio.NoGender:
                return { none: true };

            case PokemonGenderRatio.Male100Female0:
                return { male: 100, female: 0 };

            case PokemonGenderRatio.Male0Female100:
                return { male: 0, female: 100 };

            case PokemonGenderRatio.Male75Female25:
                return { male: 75, female: 25 };

            case PokemonGenderRatio.Male25Female75:
                return { male: 25, female: 75 };

            case PokemonGenderRatio.Male875Female125:
                return { male: 87.5, female: 12.5 };

            case PokemonGenderRatio.Male125Female875:
                return { male: 12.5, female: 87.5 };

            default:
                const typeCheck: never = genderRatio;
                throw new Error(`Invalid gender ratio: ${typeCheck}`);
        }
    }
}
