import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupMoveCustomId
{
    LookupPokemon = 'Lookup Pokemon that Know This Move',
}

export class LookupMoveActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: LookupMoveCustomId.LookupPokemon,
                    label: LookupMoveCustomId.LookupPokemon,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
