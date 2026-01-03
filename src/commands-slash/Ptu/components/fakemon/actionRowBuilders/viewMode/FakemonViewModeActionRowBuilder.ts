import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum FakemonViewModeButtonCustomIds
{
    EditMode = 'fakemon-view-mode-overview-go-to-edit-mode',
}

export class FakemonViewModeActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: FakemonViewModeButtonCustomIds.EditMode,
                    emoji: '✏️',
                    label: 'Go to Edit Mode',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
