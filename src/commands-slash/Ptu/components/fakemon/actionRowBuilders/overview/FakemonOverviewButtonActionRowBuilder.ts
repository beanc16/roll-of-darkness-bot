import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} from 'discord.js';

export enum FakemonOverviewButtonCustomIds
{
    Validate = 'Check for Errors',
    CheckMoveLevels = 'Check Move Levels',
    CheckMoveProgression = 'Check Move Progression',
}

export class FakemonOverviewButtonActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: FakemonOverviewButtonCustomIds.Validate,
                    label: FakemonOverviewButtonCustomIds.Validate,
                    emoji: '🧪',
                    style: ButtonStyle.Secondary,
                }),
                new ButtonBuilder({
                    customId: FakemonOverviewButtonCustomIds.CheckMoveLevels,
                    label: FakemonOverviewButtonCustomIds.CheckMoveLevels,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
                new ButtonBuilder({
                    customId: FakemonOverviewButtonCustomIds.CheckMoveProgression,
                    label: FakemonOverviewButtonCustomIds.CheckMoveProgression,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
