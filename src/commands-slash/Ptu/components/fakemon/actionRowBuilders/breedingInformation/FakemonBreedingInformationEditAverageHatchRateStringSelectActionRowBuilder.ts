import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { PtuAverageHatchRate } from '../../../../types/pokemon.js';
import { FakemonBreedingInformationStringSelectCustomIds } from './types.js';

export class FakemonBreedingInformationEditAverageHatchRateStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonBreedingInformationStringSelectCustomIds.EditAverageHatchRate,
                    placeholder: FakemonBreedingInformationStringSelectCustomIds.EditAverageHatchRate,
                    options: Object.values(PtuAverageHatchRate)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
