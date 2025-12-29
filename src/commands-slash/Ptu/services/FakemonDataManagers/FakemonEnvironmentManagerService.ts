import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PokemonDiet, PokemonHabitat } from '../../types/pokemon.js';

export class FakemonEnvironmentManagerService
{
    private static allDiets = new Set(Object.values(PokemonDiet));
    private static allHabitats = new Set(Object.values(PokemonHabitat));

    public static async setDiets({
        messageId,
        fakemon,
        diets,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        diets: PokemonDiet[];
    }): Promise<PtuFakemonCollection>
    {
        if (diets.length > 2)
        {
            throw new Error('Fakemon must have 0-2 diets');
        }

        const invalidDiets = diets.filter((diet) => !this.allDiets.has(diet));
        if (invalidDiets.length > 0)
        {
            throw new Error(`Invalid diets: ${invalidDiets.join(', ')}`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            diets,
        });
    }

    public static async setHabitats({
        messageId,
        fakemon,
        habitats,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        habitats: PokemonHabitat[];
    }): Promise<PtuFakemonCollection>
    {
        if (habitats.length > 5)
        {
            throw new Error('Fakemon must have 0-5 habitats');
        }

        const invalidHabitats = habitats.filter((habitat) => !this.allHabitats.has(habitat));
        if (invalidHabitats.length > 0)
        {
            throw new Error(`Invalid habitats: ${invalidHabitats.join(', ')}`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            habitats,
        });
    }
}
