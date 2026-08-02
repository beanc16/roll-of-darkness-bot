import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedBuilders } from '../../../shared/embed-messages/shared.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class QrLegendaryAurasStrategy
{
    public static key: PtuQuickReferenceInfo.LegendaryAuras = PtuQuickReferenceInfo.LegendaryAuras;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Create the lines of the embed message
        const lines = [
            `${Text.bold('Restrictions')}`,
            '- A Legendary Pokemon may only have three Auras active at any time, even if they possess more.',
            `- When facing another Legendary Pokemon, if they share the same Aura, neither user is affected by that particular Aura (for example, Mew's Life Aura would have no effect on Ho-oh and vice versa).`,
            '- When a Legendary Pokemon is captured, it might not have access to all, if any, of its Auras.',
            '- Arceus has access to every Legendary Aura except for Glitch, Rivalry, and Symbiotic.',
            '',
            `${Text.bold('Active Effects')}`,
            `- Any number of Auras can be actived as a Free Action on a Legendary Pokemon's turn.`,
            '- While a Legendary Pokemon has an Aura active, they may treat the Type Effectiveness of a single Super Effective attack as a Neutral Resistance once per round for each Aura activated as a Free Action Interrupt (so, if they have 3 Auras active, this can be done thrice per round).',
            '- If an Aura is disabled by any means and a Legendary Pokemon possesses more than just the currently active Auras, they may activate a remaining one as a Free Action.',
            '- A Legendary Pokemon may extend their Aura to an ally as a Swift Action, empowering them. This may be a permanent or temporary blessing.',
            '',
            `${Text.bold('Passive Effects')}`,
            '- For each Aura that a Legendary Pokemon has active, they gain +1 to each of their Combat Stages.',
        ];

        // Parse the text into embed messages
        const embeds = getPagedEmbedBuilders({
            title: 'Legendary Aura Basic Guidelines',
            pages: [
                lines.join('\n'),
            ],
        });

        // Send the embed messages
        await interaction.editReply({
            embeds,
        });

        return true;
    }
}
