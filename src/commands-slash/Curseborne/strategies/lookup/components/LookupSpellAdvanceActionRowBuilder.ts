import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupSpellAdvanceCustomId
{
    LookupSpells = 'Lookup Associated Spells',
}

export class LookupSpellAdvanceActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: LookupSpellAdvanceCustomId.LookupSpells,
                    label: LookupSpellAdvanceCustomId.LookupSpells,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
            ],
        });
    }
}
