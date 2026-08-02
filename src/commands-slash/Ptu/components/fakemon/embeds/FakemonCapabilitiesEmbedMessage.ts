import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonCapabilitiesEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'capabilities'>)
    {
        super({
            title: 'Capabilities',
            descriptionLines: FakemonCapabilitiesEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ capabilities }: Pick<PtuPokemon, 'capabilities'>): string[]
    {
        const {
            overland,
            swim,
            sky,
            levitate,
            burrow,
            highJump,
            lowJump,
            power,
            other,
        } = capabilities;

        return [
            `Overland: ${overland}`,
            ...(swim !== undefined ? [`Swim: ${swim}`] : []),
            ...(sky !== undefined ? [`Sky: ${sky}`] : []),
            ...(levitate !== undefined ? [`Levitate: ${levitate}`] : []),
            ...(burrow !== undefined ? [`Burrow: ${burrow}`] : []),
            `Jump: ${highJump}/${lowJump}`,
            `Power: ${power}`,
            (other ?? []).join(', '),
        ];
    }
}
