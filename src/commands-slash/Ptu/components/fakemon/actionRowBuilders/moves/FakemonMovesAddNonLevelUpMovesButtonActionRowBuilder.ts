import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

import { FakemonMovesButtonCustomIds } from './types.js';

export class FakemonMovesAddNonLevelUpMovesButtonActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor(
        customId: FakemonMovesButtonCustomIds.AddEggMoves
            | FakemonMovesButtonCustomIds.AddTmHmMoves
            | FakemonMovesButtonCustomIds.AddTutorMoves,
    )
    {
        super({
            components: [
                new ButtonBuilder({
                    customId,
                    label: customId,
                    emoji: '➕',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
