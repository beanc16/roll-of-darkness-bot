import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupAbilityCustomId
{
    LookupPokemon = 'Lookup Pokemon that Know This Ability',
}

export class LookupAbilityActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: LookupAbilityCustomId.LookupPokemon,
                    label: LookupAbilityCustomId.LookupPokemon,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
