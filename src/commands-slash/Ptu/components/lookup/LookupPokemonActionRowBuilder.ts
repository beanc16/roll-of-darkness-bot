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
    LookupBasedOnMove = 'Lookup "Based On" Move',
    LookupPokemonByBasedOnMove = 'Lookup Pokemon by "Based On" Move',
}

interface LookupPokemonActionRowBuilderOptions
{
    abilityName?: string;
    capabilityName?: string;
    eggGroups?: string[];
    moveName?: string;
    basedOnMoveName?: string;
}

export class LookupPokemonActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor(options: LookupPokemonActionRowBuilderOptions = {})
    {
        super();

        const labelAndId = LookupPokemonActionRowBuilder.getLabelAndId(options);

        if (labelAndId.length > 0)
        {
            this.setComponents(
                labelAndId.map(({ customId, label }) => new ButtonBuilder({
                    customId,
                    label,
                    emoji: '🔎',
                    style: ButtonStyle.Secondary,
                })),
            );
        }
    }

    private static getLabelAndId(options: LookupPokemonActionRowBuilderOptions = {}): {
        customId: LookupPokemonCustomId;
        label: string;
    }[]
    {
        if (options.abilityName)
        {
            return [{
                customId: LookupPokemonCustomId.LookupAbility,
                label: LookupPokemonCustomId.LookupAbility,
            }];
        }

        if (options.capabilityName)
        {
            return [{
                customId: LookupPokemonCustomId.LookupCapability,
                label: LookupPokemonCustomId.LookupCapability,
            }];
        }

        if (options.eggGroups)
        {
            return [{
                customId: LookupPokemonCustomId.LookupEggGroups,
                label: LookupPokemonCustomId.LookupEggGroups,
            }];
        }

        if (options.moveName)
        {
            return [
                {
                    customId: LookupPokemonCustomId.LookupMove,
                    label: LookupPokemonCustomId.LookupMove,
                },
                ...(options.basedOnMoveName
                    ? [{
                        customId: LookupPokemonCustomId.LookupBasedOnMove,
                        label: LookupPokemonCustomId.LookupBasedOnMove,
                    }, {
                        customId: LookupPokemonCustomId.LookupPokemonByBasedOnMove,
                        label: LookupPokemonCustomId.LookupPokemonByBasedOnMove,
                    }]
                    : []
                ),
            ];
        }

        return [];
    }
}
