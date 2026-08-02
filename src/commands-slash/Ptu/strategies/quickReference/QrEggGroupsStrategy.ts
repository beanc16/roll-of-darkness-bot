import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import { PokemonEggGroup } from '../../types/pokemon.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

interface EggGroupDetail
{
    name: PokemonEggGroup;
    shortDescription: string;
    longDescription: string;
}

@staticImplements<PtuChatIteractionStrategy>()
export class QrEggGroupsStrategy
{
    public static key: PtuQuickReferenceInfo.EggGroups = PtuQuickReferenceInfo.EggGroups;

    public static eggGroupDetails: EggGroupDetail[] = [
        {
            name: PokemonEggGroup.Amorphous,
            shortDescription: 'No definite form',
            longDescription: 'Pokémon in this group are amorphous, having no definite form (this was once known as the Indeterminate group).',
        },
        {
            name: PokemonEggGroup.Bug,
            shortDescription: 'Insectoid (bug-like) in appearance',
            longDescription: 'Pokémon in this group are insectoid (bug-like) in appearance.',
        },
        {
            name: PokemonEggGroup.Ditto,
            shortDescription: 'The Ditto species',
            longDescription: 'Ditto is the only Pokémon in this group, and is capable of breeding with all other Pokémon (regardless of gender) aside from those in the None, Indeterminate, and Ditto groups.',
        },
        {
            name: PokemonEggGroup.Dragon,
            shortDescription: 'Reptilian or draconic in appearance',
            longDescription: 'Pokémon in this group are reptilian or draconic in appearance.',
        },
        {
            name: PokemonEggGroup.Fairy,
            shortDescription: 'Petite and considered very cute',
            longDescription: 'Pokémon in this group are petite and considered very cute.',
        },
        {
            name: PokemonEggGroup.Field,
            shortDescription: 'Terrestrial in nature',
            longDescription: 'The largest group, Pokémon here are terrestrial in nature (this was once known as the Ground group).',
        },
        {
            name: PokemonEggGroup.Flying,
            shortDescription: 'Avian (birdlike) in appearance',
            longDescription: 'Pokémon in this group are avian (birdlike) in appearance.',
        },
        {
            name: PokemonEggGroup.Grass,
            shortDescription: 'Plantlike in appearance',
            longDescription: 'Pokémon in this group are plantlike in appearance (this was once known as the Plant group).',
        },
        {
            name: PokemonEggGroup.Humanshape,
            shortDescription: 'Fully bipedal humanoid',
            longDescription: 'Pokémon in this group are fully bipedal humanoids (this is also known as the Human-Like group).',
        },
        {
            name: PokemonEggGroup.Mineral,
            shortDescription: 'Inorganic in nature',
            longDescription: 'Pokémon in this group are inorganic in nature.',
        },
        {
            name: PokemonEggGroup.Monster,
            shortDescription: 'Saurian/kaiju-like in appearance and nature',
            longDescription: 'Pokémon in this group are saurian/kaiju-like in appearance and nature.',
        },
        {
            name: PokemonEggGroup.None,
            shortDescription: 'Unable to breed',
            longDescription: 'Pokémon in this group are unable to breed.',
        },
        {
            name: PokemonEggGroup.Water1,
            shortDescription: 'Amphibious in nature',
            longDescription: 'Pokémon in this group are amphibious in nature.',
        },
        {
            name: PokemonEggGroup.Water2,
            shortDescription: 'Piscine (fishlike) in appearance',
            longDescription: 'Pokémon in this group are piscine (fishlike) in appearance.',
        },
        {
            name: PokemonEggGroup.Water3,
            shortDescription: 'Resembles an aquatic invertebrate',
            longDescription: 'Pokémon in this group resemble aquatic invertebrates.',
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

        const embedDescription = this.eggGroupDetails.reduce((acc, { name, longDescription: description }) =>
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
