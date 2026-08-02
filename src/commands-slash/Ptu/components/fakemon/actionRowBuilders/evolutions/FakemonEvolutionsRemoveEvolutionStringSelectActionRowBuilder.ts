import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonEvolutionsStringSelectCustomIds } from './types.js';

export class FakemonEvolutionsRemoveEvolutionStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor({ evolution }: Pick<PtuFakemonCollection, 'evolution'>)
    {
        // maxValues must be no more the array's length, and that should never exceed 10
        const maxValues = Math.min(evolution.length, 10);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonEvolutionsStringSelectCustomIds.RemoveEvolution,
                    placeholder: FakemonEvolutionsStringSelectCustomIds.RemoveEvolution,
                    ...(maxValues > 0
                        ? {
                            // Don't include values unless there's something in the array
                            options: evolution.map(e => ({
                                label: e.name,
                                value: e.name,
                                description: `Stage: ${e.stage} | Level: ${e.level}`,
                                default: true,
                            })),
                            minValues: 0,
                            maxValues,
                        }
                        : {
                            // If there's nothing, then disable this with at least one value so Discord doesn't throw an error
                            disabled: true,
                            options: [{ label: 'No options available', value: 'None' }],
                        }),
                }),
            ],
        });
    }
}
