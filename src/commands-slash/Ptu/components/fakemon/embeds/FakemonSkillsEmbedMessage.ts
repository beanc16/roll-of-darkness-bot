import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonSkillsEmbedMessage extends FakemonEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'skills'>)
    {
        super({
            title: 'Skills',
            descriptionLines: FakemonSkillsEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines({ skills }: Pick<PtuPokemon, 'skills'>): string[]
    {
        const {
            acrobatics,
            athletics,
            combat,
            focus,
            perception,
            stealth,
        } = skills;

        return [
            `Acro: ${acrobatics}`,
            `Athl: ${athletics}`,
            `Combat: ${combat}`,
            `Focus: ${focus}`,
            `Percep: ${perception}`,
            `Stealth: ${stealth}`,
        ];
    }
}
