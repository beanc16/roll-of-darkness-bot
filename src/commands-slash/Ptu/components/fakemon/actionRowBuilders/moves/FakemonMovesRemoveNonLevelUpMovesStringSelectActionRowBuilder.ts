import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { STRING_SELECT_ACTION_ROW_MAX_OPTIONS } from '../../../../../../types/discord.js';
import { FakemonMoveManagerService } from '../../../../services/FakemonDataManagers/FakemonMoveManagerService.js';
import { FakemonMovesStringSelectCustomIds } from './types.js';

export class FakemonMovesRemoveNonLevelUpMovesStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(
        customId: FakemonMovesStringSelectCustomIds.RemoveEggMoves
            | FakemonMovesStringSelectCustomIds.RemoveTmHmMoves
            | FakemonMovesStringSelectCustomIds.RemoveTutorMoves,
        moves: string[],
    )
    {
        const maxValues = Math.min(
            moves.length,
            customId === FakemonMovesStringSelectCustomIds.RemoveEggMoves
                ? FakemonMoveManagerService.MAX_EGG_MOVES
                : STRING_SELECT_ACTION_ROW_MAX_OPTIONS,
        );

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId,
                    placeholder: customId,
                    ...(maxValues > 0
                        ? {
                            // Don't include values unless there's something in the array
                            options: moves.map(option => ({
                                label: option,
                                value: option,
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
