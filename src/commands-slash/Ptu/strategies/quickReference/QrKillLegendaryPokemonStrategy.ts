import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedBuilders } from '../../../shared/embed-messages/shared.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class QrKillLegendaryPokemonStrategy
{
    public static key: PtuQuickReferenceInfo.HowToKillLegendaryPokemon = PtuQuickReferenceInfo.HowToKillLegendaryPokemon;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Create the lines of the embed message
        const lines = [
            `${Text.bold('How to Kill Gods')}`,
            '1. Wait for them to live out their natural life span, at which point they return to the state of a Pokemon egg to be reborn. Gods usually know when this time is approaching and tend to find shelter with one of their own kind or a trusted follower.',
            `2. First, disable all of their legendary auras (the Symbiotic Aura doesn't count against this number). Then, follow the rules under "What Happens When a God's Auras are Disabled?"`,
            '',
            `${Text.bold('How to Disable Legendary Auras')}`,
            `One of a God's auras may be disabled once every two rounds in one of the following ways:`,
            '- Inflict massive damage with a super effective attack. When this happens, the targeted god will choose which of their auras is broken.',
            `- Be a god and choose to willingly disable one of your auras in order to disable someone else's (a system of checks and balances between gods). As an EoT Standard Action, roll a d20 with an AC of 10 (this is not classified as a move nor a struggle attack). Failing the AC has no penalty, meeting the AC instantly nullifies one aura for both legendaries. When this happens, the attacking god chooses which of their and their target's auras are broken.`,
            `- Be one of the Lake Guardians. Same as the previous bullet point, but as an At-Will Standard Action with an AC of 10 instead. Also, don't disable any of the Lake Guardian's own auras upon succeeding. (Targeted legendaries can still only have one aura disabled once every two rounds.)`,
            `- Quite simply attempt to shatter the aura of a subservient legendary and instantly succeed. This does not disable your own auras upon instantly succeeding. (An example of a master is Lugia with the Legendary Birds being subservient). This is a perk of being the master of other gods. When this happens, the attacking god chooses which of their target's auras are broken.`,
            '- Be a legendary with a rival (like the tower duo), and follow the same rules as a lake guardian against specifically your rival.',
            '- Have the GM homebrew lore for you like a legendary being weak to a legendary blade, beating someone in a specific place with a specific bet on the line, etc.',
            '- Have the Godslayer gift and follow its mechanics.',
            '',
            `${Text.bold(`What Happens When a God's Auras are Disabled?`)}`,
            '- The god cannot faint nor be captured while auras are active.',
            '- When brought below 0HP with auras active, the god will usually attempt to flee from battle or make a final stand for its life. Gods faint as normal when all auras are disabled.',
            '- The god can be Coup De Graced when below 0HP whether auras are disabled or not, but will attempt to prevent it from happening.',
            '- The god dies at -200% Max HP whether auras are enabled or disabled, but cannot die from excessive injuries.',
            '- Disabled auras will be restored to their full effect after 24 hours.',
            '',
            `${Text.bold('Godly Eggs')}`,
            `Destroying a god's egg or preventing a god from going into egg form kills the god in question. Otherwise, godly eggs are just normal Pokemon eggs with a god inside.`,
            '',
            `${Text.bold('What Happens When a God Dies?')}`,
            '- A human can usurp them.',
            `- The god's original creator can make a new version of them or something else entirely to take over the deceased god's domains.`,
            '- The god is slain indefinitely.',
            `- Except this isn't true for most outsiders, aliens, or man-made creatures. For most of these creatures, it causes aftermath in the immediate area and that's it. Arceus and other truly immortal beings play by different/completely unknown rules when they die (if they even can).`,
        ];

        // Parse the text into embed messages
        const embeds = getPagedEmbedBuilders({
            title: 'How to Kill Legendary Pokemon',
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
