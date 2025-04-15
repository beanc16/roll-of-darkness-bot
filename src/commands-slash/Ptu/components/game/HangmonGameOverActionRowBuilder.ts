import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

import { HangmonGuessHistoryButton } from './HangmonGuessHistoryButton.js';

export enum HangmonGameOverCustomIds
{
    PlayAgain = 'Play Again',
    LookupPokemon = 'Lookup Pokemon',
    GuessHistory = 'Guess History',
}

export class HangmonGameOverActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: HangmonGameOverCustomIds.PlayAgain,
                    label: HangmonGameOverCustomIds.PlayAgain,
                    emoji: '🔄',
                    style: ButtonStyle.Secondary,
                }),
                new ButtonBuilder({
                    customId: HangmonGameOverCustomIds.LookupPokemon,
                    label: HangmonGameOverCustomIds.LookupPokemon,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
                new HangmonGuessHistoryButton(HangmonGameOverCustomIds.GuessHistory),
            ],
        });
    }
}
