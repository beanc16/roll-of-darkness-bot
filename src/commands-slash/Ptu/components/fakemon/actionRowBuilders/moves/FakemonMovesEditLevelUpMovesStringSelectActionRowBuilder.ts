import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonMovesStringSelectCustomIds } from './types.js';

export class FakemonMovesEditLevelUpMovesStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor({ moveList }: Pick<PtuFakemonCollection, 'moveList'>)
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonMovesStringSelectCustomIds.EditLevelUpMoves,
                    placeholder: FakemonMovesStringSelectCustomIds.EditLevelUpMoves,
                    ...(moveList.levelUp.length > 0
                        ? {
                            // Don't include values unless there's something in the array
                            options: moveList.levelUp
                                .map(option => ({
                                    label: option.move,
                                    value: option.move,
                                    description: [
                                        `Level: ${option.level}`,
                                        `Type: ${option.type}`,
                                    ].join(' | '),
                                })),
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
