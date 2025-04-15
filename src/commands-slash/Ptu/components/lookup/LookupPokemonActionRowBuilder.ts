import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupPokemonCustomId
{
    LookupAbility = 'Lookup Ability',
    LookupMove = 'Lookup Move',
}

interface LookupPokemonActionRowBuilderOptions
{
    abilityName?: string;
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
            [LookupPokemonCustomId.LookupAbility]: 'Lookup Ability',
            [LookupPokemonCustomId.LookupMove]: 'Lookup Move',
        };

        if (options.abilityName)
        {
            return {
                customId: LookupPokemonCustomId.LookupAbility,
                label: labelMap[LookupPokemonCustomId.LookupAbility],
            };
        }

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
