import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonSizeInformationEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'sizeInformation'>)
    {
        super({
            title: 'Size Information',
            descriptionLines: FakemonSizeInformationEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ sizeInformation }: Pick<PtuPokemon, 'sizeInformation'>): string[]
    {
        const { height, weight } = sizeInformation;

        return [
            `Height: ${height.freedom} / ${height.metric} (${height.ptu})`,
            `Weight: ${weight.freedom} / ${weight.metric} (${weight.ptu})`,
        ];
    }
}
