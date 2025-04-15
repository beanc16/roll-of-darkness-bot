import { ButtonBuilder, ButtonStyle } from 'discord.js';

export class HangmonGuessHistoryButton extends ButtonBuilder
{
    constructor(customId: string)
    {
        super({
            customId,
            label: customId,
            emoji: '📋',
            style: ButtonStyle.Secondary,
        });
    }
}
