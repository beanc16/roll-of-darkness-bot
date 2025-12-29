import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PokemonHabitat } from '../../../../types/pokemon.js';
import { FakemonEnvironmentStringSelectCustomIds } from './types.js';

export class FakemonEnvironmentEditHabitatsStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor({ habitats }: Pick<PtuFakemonCollection, 'habitats'>)
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonEnvironmentStringSelectCustomIds.EditHabitats,
                    placeholder: FakemonEnvironmentStringSelectCustomIds.EditHabitats,
                    options: Object.values(PokemonHabitat)
                        .map(option => ({
                            label: option,
                            value: option,
                            default: habitats.includes(option),
                        })),
                    minValues: 0,
                    maxValues: 5,
                }),
            ],
        });
    }
}
