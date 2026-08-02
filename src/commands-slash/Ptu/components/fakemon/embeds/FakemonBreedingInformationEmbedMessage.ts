import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonBreedingInformationEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'breedingInformation'>)
    {
        super({
            title: 'Breeding Information',
            descriptionLines: FakemonBreedingInformationEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ breedingInformation }: Pick<PtuPokemon, 'breedingInformation'>): string[]
    {
        const {
            genderRatio,
            eggGroups,
            averageHatchRate,
        } = breedingInformation;

        return [
            `Gender Ratio: ${!genderRatio.none ? `${genderRatio.male}% M / ${genderRatio.female}% F` : 'No Gender'}`,
            `Egg Group${eggGroups.length > 1 ? 's' : ''}: ${eggGroups.length > 0 ? eggGroups.join(', ') : 'None'}`,
            ...(averageHatchRate ? [`Average Hatch Rate: ${averageHatchRate}`, ''] : ['']),
        ];
    }
}
