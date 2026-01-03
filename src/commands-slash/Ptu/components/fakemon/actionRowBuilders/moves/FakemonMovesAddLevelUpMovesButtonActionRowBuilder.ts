import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

import { FakemonMovesButtonCustomIds } from './types.js';

export class FakemonMovesAddLevelUpMovesButtonActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: FakemonMovesButtonCustomIds.AddLevelUpMoves,
                    label: FakemonMovesButtonCustomIds.AddLevelUpMoves,
                    emoji: '➕',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
