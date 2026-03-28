import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} from 'discord.js';

export enum FakemonOverviewButtonCustomIds
{
    Validate = 'Check for Errors',
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
            ],
        });
    }
}
