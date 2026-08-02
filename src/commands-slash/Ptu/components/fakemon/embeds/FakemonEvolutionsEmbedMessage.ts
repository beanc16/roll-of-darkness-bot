import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonEvolutionsEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'evolution'>)
    {
        super({
            title: 'Evolution',
            descriptionLines: FakemonEvolutionsEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ evolution }: Pick<PtuPokemon, 'evolution'>): string[]
    {
        return evolution.sort((a, b) => a.stage - b.stage).map(({
            name: evolutionName,
            level,
            stage,
        }) =>
        {
            const minimumLevelString = (stage >= 2 && level > 1)
                ? ` Minimum ${level}`
                : ''; // Don't include minimum level for 2+ stage evolutions that're level 1. They probably evolve with an evolution stone, which is included in the name.

            return `${stage} - ${evolutionName}${minimumLevelString}`;
        });
    }
}
