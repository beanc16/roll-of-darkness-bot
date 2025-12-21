import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonBasicInformationEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'types' | 'abilities'>)
    {
        super({
            title: 'Basic Information',
            descriptionLines: FakemonBasicInformationEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ types, abilities }: Pick<PtuPokemon, 'types' | 'abilities'>): string[]
    {
        const {
            basicAbilities,
            advancedAbilities,
            highAbility,
        } = abilities;

        return [
            `Type${types.length > 1 ? 's' : ''}: ${types.join('/')}`,
            ...basicAbilities.map((ability, index) => `Basic Ability: ${index + 1}: ${ability}`),
            ...advancedAbilities.map((ability, index) => `Advanced Ability: ${index + 1}: ${ability}`),
            `High Ability: ${highAbility}`,
        ];
    }
}
