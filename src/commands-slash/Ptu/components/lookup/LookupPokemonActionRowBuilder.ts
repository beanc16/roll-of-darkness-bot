import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupPokemonCustomId
{
    LookupMove = 'Lookup Move',
}

interface LookupPokemonActionRowBuilderOptions
{
    moveName?: string;
}

export class LookupPokemonActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor(options: LookupPokemonActionRowBuilderOptions = {})
    {
        super();

        const labelAndId = LookupPokemonActionRowBuilder.getLabelAndId(options);

        if (labelAndId)
        {
            this.setComponents([
                new ButtonBuilder({
                    customId: labelAndId.customId,
                    label: labelAndId.label,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                }),
            ]);
        }
    }

    private static getLabelAndId(options: LookupPokemonActionRowBuilderOptions = {}): undefined | {
        customId: LookupPokemonCustomId;
        label: string;
    }
    {
        const labelMap: Record<LookupPokemonCustomId, string> = {
            [LookupPokemonCustomId.LookupMove]: 'Lookup Move',
        };

        if (options.moveName)
        {
            return {
                customId: LookupPokemonCustomId.LookupMove,
                label: labelMap[LookupPokemonCustomId.LookupMove],
            };
        }

        return undefined;
    }
}
