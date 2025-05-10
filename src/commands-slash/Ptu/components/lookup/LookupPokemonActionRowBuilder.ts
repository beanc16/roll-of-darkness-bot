import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum LookupPokemonCustomId
{
    LookupAbility = 'Lookup Ability',
    LookupCapability = 'Lookup Capability',
    LookupEggGroups = 'Lookup Egg Groups',
    LookupMove = 'Lookup Move',
}

interface LookupPokemonActionRowBuilderOptions
{
    abilityName?: string;
    capabilityName?: string;
    eggGroups?: string[];
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
        if (options.abilityName)
        {
            return {
                customId: LookupPokemonCustomId.LookupAbility,
                label: LookupPokemonCustomId.LookupAbility,
            };
        }

        if (options.capabilityName)
        {
            return {
                customId: LookupPokemonCustomId.LookupCapability,
                label: LookupPokemonCustomId.LookupCapability,
            };
        }

        if (options.eggGroups)
        {
            return {
                customId: LookupPokemonCustomId.LookupEggGroups,
                label: LookupPokemonCustomId.LookupEggGroups,
            };
        }

        if (options.moveName)
        {
            return {
                customId: LookupPokemonCustomId.LookupMove,
                label: LookupPokemonCustomId.LookupMove,
            };
        }

        return undefined;
    }
}
