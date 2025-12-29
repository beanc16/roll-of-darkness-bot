import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PokemonType } from '../../types/pokemon.js';

export class FakemonBasicInformationManagerService
{
    private static allTypes = new Set(Object.values(PokemonType));

    public static async setTypes({
        messageId,
        fakemon,
        types,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        types: PokemonType[];
    }): Promise<PtuFakemonCollection>
    {
        if (types.length === 0 || types.length > 2)
        {
            throw new Error('Fakemon must have 1-2 types');
        }

        const invalidTypes = types.filter((type) => !this.allTypes.has(type));
        if (invalidTypes.length > 0)
        {
            throw new Error(`Invalid types: ${invalidTypes.join(', ')}`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            types,
        });
    }
}
