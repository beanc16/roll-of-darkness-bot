import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum FakemonBackToOverviewButtonCustomIds
{
    BackToOverview = 'Overview',
}

export class FakemonBackToOverviewButtonActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: FakemonBackToOverviewButtonCustomIds.BackToOverview,
                    label: 'Overview',
                    emoji: '⬅️',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
