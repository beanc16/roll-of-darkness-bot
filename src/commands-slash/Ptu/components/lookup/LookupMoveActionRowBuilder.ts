import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupMoveCustomId
{
    LookupPokemon = 'Lookup Pokemon that Know This Move',
    LookupBasedOnMove = 'Lookup "Based On" Move',
}

interface LookupMoveActionRowBuilderOptions
{
    basedOn?: string;
}

export class LookupMoveActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor(options: LookupMoveActionRowBuilderOptions = {})
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: LookupMoveCustomId.LookupPokemon,
                    label: LookupMoveCustomId.LookupPokemon,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
                ...(options.basedOn
                    ? [
                        new ButtonBuilder({
                            customId: LookupMoveCustomId.LookupBasedOnMove,
                            label: LookupMoveCustomId.LookupBasedOnMove,
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
