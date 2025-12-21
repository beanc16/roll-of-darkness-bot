import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonEnvironmentEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'diets' | 'habitats'>)
    {
        super({
            title: 'Environment',
            descriptionLines: FakemonEnvironmentEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ diets, habitats }: Pick<PtuPokemon, 'diets' | 'habitats'>): string[]
    {
        return [
            `Diet: ${diets.join(', ')}`,
            `Habitat${habitats.length > 1 ? 's' : ''}: ${habitats.join(', ')}`,
        ];
    }
}
