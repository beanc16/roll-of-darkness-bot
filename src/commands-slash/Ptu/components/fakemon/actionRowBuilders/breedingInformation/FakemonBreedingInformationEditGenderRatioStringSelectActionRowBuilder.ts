import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { PokemonGenderRatio } from '../../../../types/pokemon.js';
import { FakemonBreedingInformationStringSelectCustomIds } from './types.js';

export class FakemonBreedingInformationEditGenderRatioStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonBreedingInformationStringSelectCustomIds.EditGenderRatio,
                    placeholder: FakemonBreedingInformationStringSelectCustomIds.EditGenderRatio,
                    options: Object.values(PokemonGenderRatio)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
