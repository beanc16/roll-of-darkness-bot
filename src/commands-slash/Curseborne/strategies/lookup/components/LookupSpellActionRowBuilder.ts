import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupSpellCustomId
{
    LookupSpellAdvances = 'Lookup Associated Spell Advances',
}

export class LookupSpellActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: LookupSpellCustomId.LookupSpellAdvances,
                    label: LookupSpellCustomId.LookupSpellAdvances,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
