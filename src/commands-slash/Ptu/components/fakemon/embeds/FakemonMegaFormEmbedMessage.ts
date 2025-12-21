import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonMegaFormEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'megaEvolutions'>)
    {
        const numOfMegaEvolutions = (args.megaEvolutions ?? []).length;

        super({
            title: `Mega Evolution${numOfMegaEvolutions > 1 ? 's' : ''}`,
            descriptionLines: FakemonMegaFormEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ megaEvolutions = [] }: Pick<PtuPokemon, 'megaEvolutions'>): string[]
    {
        return megaEvolutions.map(megaEvolution => [
            megaEvolution.name,
            `Type${megaEvolution.types.length > 1 ? 's' : ''}: ${megaEvolution.types.join('/')}`,
            `Stats: ${[
                (megaEvolution.stats.hp !== undefined ? `${megaEvolution.stats.hp} HP` : ''),
                (megaEvolution.stats.attack !== undefined ? `${megaEvolution.stats.attack} Attack` : ''),
                (megaEvolution.stats.defense !== undefined ? `${megaEvolution.stats.defense} Defense` : ''),
                (megaEvolution.stats.specialAttack !== undefined ? `${megaEvolution.stats.specialAttack} Special Attack` : ''),
                (megaEvolution.stats.specialDefense !== undefined ? `${megaEvolution.stats.specialDefense} Special Defense` : ''),
                (megaEvolution.stats.speed !== undefined ? `${megaEvolution.stats.speed} Speed` : ''),
            ].filter(str => str.length > 0).join(', ')}`,
            `Ability: ${megaEvolution.ability}`,
            [
                (megaEvolution.abilityShift ? megaEvolution.abilityShift : ''),
                (megaEvolution.capabilities ? `Capabilities: ${megaEvolution.capabilities.join(', ')}` : ''),
                '',
            ].filter(str => str.length > 0).join('\n'),
        ].join('\n'));
    }
}
