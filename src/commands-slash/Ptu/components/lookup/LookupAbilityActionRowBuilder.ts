import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupAbilityCustomId
{
    LookupPokemon = 'Lookup Pokemon that Know This Ability',
    LookupBasedOnAbility = 'Lookup "Based On" Ability',
}

interface LookupAbilityActionRowBuilderOptions
{
    basedOn?: string;
}

export class LookupAbilityActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor(options: LookupAbilityActionRowBuilderOptions = {})
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: LookupAbilityCustomId.LookupPokemon,
                    label: LookupAbilityCustomId.LookupPokemon,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
                ...(options.basedOn
                    ? [
                        new ButtonBuilder({
                            customId: LookupAbilityCustomId.LookupBasedOnAbility,
                            label: LookupAbilityCustomId.LookupBasedOnAbility,
                            emoji: '🔎',
                            style: ButtonStyle.Secondary,
                        }),
                    ]
                    : []
                ),
            ],
        });
    }
}
