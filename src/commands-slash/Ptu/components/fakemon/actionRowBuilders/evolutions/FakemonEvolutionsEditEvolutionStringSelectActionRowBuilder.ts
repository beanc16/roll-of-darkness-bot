import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonEvolutionsStringSelectCustomIds } from './types.js';

export enum FakemonEvolutionsEditEvolutionStringSelectElementOptions
{
    AddEvolution = 'Add Evolution',
}

export class FakemonEvolutionsEditEvolutionStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor({ evolution }: Pick<PtuFakemonCollection, 'evolution'>)
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonEvolutionsStringSelectCustomIds.EditEvolution,
                    placeholder: FakemonEvolutionsStringSelectCustomIds.EditEvolution,
                    options: [
                        { label: FakemonEvolutionsEditEvolutionStringSelectElementOptions.AddEvolution, value: FakemonEvolutionsEditEvolutionStringSelectElementOptions.AddEvolution },
                        ...evolution.map(e => ({
                            label: e.name,
                            value: e.name,
                            description: `Stage: ${e.stage} | Level: ${e.level}`,
                        })),
                    ],
                }),
            ],
        });
    }
}
