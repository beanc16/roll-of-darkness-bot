import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum FakemonViewModeOverviewButtonCustomIds
{
    EditMode = 'fakemon-view-mode-overview-go-to-edit-mode',
}

export class FakemonViewModeOverviewActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: FakemonViewModeOverviewButtonCustomIds.EditMode,
                    emoji: '✏️',
                    label: 'Go to Edit Mode',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
