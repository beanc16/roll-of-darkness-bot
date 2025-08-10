import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

interface EggGroupDetail
{
    name: string;
    description: string;
}

@staticImplements<PtuChatIteractionStrategy>()
export class QrEggGroupsStrategy
{
    public static key: PtuQuickReferenceInfo.EggGroups = PtuQuickReferenceInfo.EggGroups;

    private static eggGroupDetails: EggGroupDetail[] = [
        {
            name: 'Amorphous',
            description: 'Pokémon in this group are amorphous, having no definite form.',
        },
        {
            name: 'Bug',
            description: 'Pokémon in this group are insectoid (bug-like) in appearance.',
        },
        {
            name: 'Ditto',
            description: 'Ditto is the only Pokémon in this group, and is capable of breeding with all other Pokémon (regardless of gender) aside from those in the None, Indeterminate, and Ditto groups.',
        },
        {
            name: 'Dragon',
            description: 'Pokémon in this group are reptilian or draconic in appearance.',
        },
        {
            name: 'Fairy',
            description: 'Pokémon in this group are petite and considered very cute.',
        },
        {
            name: 'Field / Ground',
            description: 'The largest group, Pokémon here are terrestrial in nature.',
        },
        {
            name: 'Flying',
            description: 'Pokémon in this group are avian (birdlike) in appearance.',
        },
        {
            name: 'Grass / Plant',
            description: 'Pokémon in this group are plantlike in appearance.',
        },
        {
            name: 'Humanshape',
            description: 'Pokémon in this group are fully bipedal humanoids.',
        },
        {
            name: 'Indeterminate',
            description: 'Pokémon in this group are unable to breed.',
        },
        {
            name: 'Mineral',
            description: 'Pokémon in this group are inorganic in nature.',
        },
        {
            name: 'Monster',
            description: 'Pokémon in this group are saurian/kaiju-like in appearance and nature.',
        },
        {
            name: 'None',
            description: 'Pokémon in this group are unable to breed.',
        },
        {
            name: 'Water 1',
            description: 'Pokémon in this group are amphibious in nature.',
        },
        {
            name: 'Water 2',
            description: 'Pokémon in this group are piscine (fishlike) in appearance.',
        },
        {
            name: 'Water 3',
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
