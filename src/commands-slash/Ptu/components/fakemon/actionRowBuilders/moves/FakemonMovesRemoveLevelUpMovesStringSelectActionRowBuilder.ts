import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { STRING_SELECT_ACTION_ROW_MAX_OPTIONS } from '../../../../../../types/discord.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonMovesStringSelectCustomIds } from './types.js';

export class FakemonMovesRemoveLevelUpMovesStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(levelUpMoves: PtuFakemonCollection['moveList']['levelUp'])
    {
        const maxValues = Math.min(levelUpMoves.length, STRING_SELECT_ACTION_ROW_MAX_OPTIONS);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonMovesStringSelectCustomIds.RemoveLevelUpMoves,
                    placeholder: FakemonMovesStringSelectCustomIds.RemoveLevelUpMoves,
                    ...(maxValues > 0
                        ? {
                            // Don't include values unless there's something in the array
                            options: levelUpMoves.map(option => ({
                                label: option.move,
                                value: option.move,
                                description: `Level: ${option.level} | Type: ${option.type}`,
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
