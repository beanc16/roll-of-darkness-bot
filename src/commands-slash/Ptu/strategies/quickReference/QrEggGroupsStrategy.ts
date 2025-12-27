import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';
import { PokemonEggGroup } from '../../types/pokemon.js';

interface EggGroupDetail
{
    name: PokemonEggGroup;
    description: string;
}

@staticImplements<PtuChatIteractionStrategy>()
export class QrEggGroupsStrategy
{
    public static key: PtuQuickReferenceInfo.EggGroups = PtuQuickReferenceInfo.EggGroups;

    private static eggGroupDetails: EggGroupDetail[] = [
        {
            name: PokemonEggGroup.Amorphous,
            description: 'Pokémon in this group are amorphous, having no definite form.',
        },
        {
            name: PokemonEggGroup.Bug,
            description: 'Pokémon in this group are insectoid (bug-like) in appearance.',
        },
        {
            name: PokemonEggGroup.Ditto,
            description: 'Ditto is the only Pokémon in this group, and is capable of breeding with all other Pokémon (regardless of gender) aside from those in the None, Indeterminate, and Ditto groups.',
        },
        {
            name: PokemonEggGroup.Dragon,
            description: 'Pokémon in this group are reptilian or draconic in appearance.',
        },
        {
            name: PokemonEggGroup.Fairy,
            description: 'Pokémon in this group are petite and considered very cute.',
        },
        {
            name: PokemonEggGroup.FieldOrGround,
            description: 'The largest group, Pokémon here are terrestrial in nature.',
        },
        {
            name: PokemonEggGroup.Flying,
            description: 'Pokémon in this group are avian (birdlike) in appearance.',
        },
        {
            name: PokemonEggGroup.GrassOrPlant,
            description: 'Pokémon in this group are plantlike in appearance.',
        },
        {
            name: PokemonEggGroup.Humanshape,
            description: 'Pokémon in this group are fully bipedal humanoids.',
        },
        {
            name: PokemonEggGroup.Indeterminate,
            description: 'Pokémon in this group are unable to breed.',
        },
        {
            name: PokemonEggGroup.Mineral,
            description: 'Pokémon in this group are inorganic in nature.',
        },
        {
            name: PokemonEggGroup.Monster,
            description: 'Pokémon in this group are saurian/kaiju-like in appearance and nature.',
        },
        {
            name: PokemonEggGroup.None,
            description: 'Pokémon in this group are unable to breed.',
        },
        {
            name: PokemonEggGroup.Water1,
            description: 'Pokémon in this group are amphibious in nature.',
        },
        {
            name: PokemonEggGroup.Water2,
            description: 'Pokémon in this group are piscine (fishlike) in appearance.',
        },
        {
            name: PokemonEggGroup.Water3,
            description: 'Pokémon in this group resemble aquatic invertebrates.',
        },
    ];

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Parse the data into embed messages
        const embeds = this.getEmbeds();

        // Send the embed messages
        await interaction.editReply({ embeds });

        return true;
    }

    private static getEmbeds(): EmbedBuilder[]
    {
        const color = 0xCDCDCD;

        const embedDescription = this.eggGroupDetails.reduce((acc, { name, description }) =>
        {
            return acc + `${Text.bold(name)}: ${description}\n`;
        }, '');

        const embed = new EmbedBuilder({
            title: 'Egg Group Details',
            description: embedDescription,
            color,
        });

        return [embed];
    }
}
