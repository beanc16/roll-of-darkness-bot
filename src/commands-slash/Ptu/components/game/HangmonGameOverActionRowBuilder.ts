import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum HangmonGameOverCustomIds
{
    PlayAgain = 'Play Again',
    LookupPokemon = 'Lookup Pokemon',
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
            ],
        });
    }
}
