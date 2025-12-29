import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { PokemonType } from '../../../../types/pokemon.js';
import { FakemonBasicInformationStringSelectCustomIds } from './types.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';

export class FakemonBIEditTypesStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor({ types }: Pick<PtuFakemonCollection, 'types'>)
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonBasicInformationStringSelectCustomIds.EditTypes,
                    placeholder: FakemonBasicInformationStringSelectCustomIds.EditTypes,
                    options: Object.values(PokemonType)
                        .map(option => ({
                            label: option,
                            value: option,
                            default: types.includes(option),
                        })),
                    minValues: 1,
                    maxValues: 2,
                }),
            ],
        });
    }
}
