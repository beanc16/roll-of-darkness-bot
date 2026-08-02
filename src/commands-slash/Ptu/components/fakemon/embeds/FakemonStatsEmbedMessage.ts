import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonStatsEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'baseStats'>)
    {
        super({
            title: 'Base Stats',
            descriptionLines: FakemonStatsEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ baseStats }: Pick<PtuPokemon, 'baseStats'>): string[]
    {
        return [
            `HP: ${baseStats.hp}`,
            `Attack: ${baseStats.attack}`,
            `Defense: ${baseStats.defense}`,
            `Special Attack: ${baseStats.specialAttack}`,
            `Special Defense: ${baseStats.specialDefense}`,
            `Speed: ${baseStats.speed}`,
            `Total: ${Object.values(baseStats).reduce((acc2, val) => acc2 + val, 0)}`,
        ];
    }
}
