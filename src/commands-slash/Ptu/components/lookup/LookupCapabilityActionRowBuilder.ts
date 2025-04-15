import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupCapabilityCustomId
{
    LookupPokemon = 'Lookup Pokemon that Know This Capability',
}

export class LookupCapabilityActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: LookupCapabilityCustomId.LookupPokemon,
                    label: LookupCapabilityCustomId.LookupPokemon,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
