import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';
import { FakemonEnvironmentStringSelectCustomIds } from './types.js';
import { PokemonDiet } from '../../../../types/pokemon.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';

export class FakemonEnvironmentEditDietsStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor({ diets }: Pick<PtuFakemonCollection, 'diets'>)
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonEnvironmentStringSelectCustomIds.EditDiets,
                    placeholder: FakemonEnvironmentStringSelectCustomIds.EditDiets,
                    options: Object.values(PokemonDiet)
                        .map(option => ({
                            label: option,
                            value: option,
                            default: diets.includes(option),
                        })),
                    minValues: 0,
                    maxValues: 2,
                }),
            ],
        });
    }
}
