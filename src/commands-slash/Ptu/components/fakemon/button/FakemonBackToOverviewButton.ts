import { ButtonBuilder, ButtonStyle } from 'discord.js';

export const fakemonBackToOverviewButtonCustomId = 'back-to-overview-button';

export class FakemonBackToOverviewButton extends ButtonBuilder
{
    constructor()
    {
        super({
            customId: fakemonBackToOverviewButtonCustomId,
            label: 'Overview',
            emoji: '⬅️',
            style: ButtonStyle.Secondary,
        });
    }
}
