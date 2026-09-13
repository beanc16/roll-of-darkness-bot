import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} from 'discord.js';

export enum PtuMoveOverviewButtonCustomIds
{
    EditName = 'Edit Name',
    Validate = 'Check for Errors',
}

export class PtuMoveOverviewButtonActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: PtuMoveOverviewButtonCustomIds.EditName,
                    label: PtuMoveOverviewButtonCustomIds.EditName,
                    emoji: '📝',
                    style: ButtonStyle.Secondary,
                }),
                new ButtonBuilder({
                    customId: PtuMoveOverviewButtonCustomIds.Validate,
                    label: PtuMoveOverviewButtonCustomIds.Validate,
                    emoji: '🧪',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
