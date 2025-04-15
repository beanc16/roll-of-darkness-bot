import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedBuilders } from '../../../embed-messages/shared.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class QrCoupDeGraceStrategy
{
    public static key: PtuQuickReferenceInfo.CoupDeGrace = PtuQuickReferenceInfo.CoupDeGrace;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Create the lines of the embed message
        const lines = [
            'Any Pokémon or Trainer can attempt a Coup de Grâce against a Fainted or otherwise completely helpless target as a Full Action. Simply, the Pokémon or Trainer makes any Attack or Move they could normally make as a Standard Action, but this attack must target only the target of the Coup de Grâce.',
            '',
            'If the Coup de Grâce hits, the attack is automatically a Critical Hit that deals +5 bonus damage (multiply this damage as part of the critical hit; this will normally make it +10, but Pokémon or Trainers with Sniper would add +15), ignoring any immunities to Critical Hits.',
            '',
            'Please note: Coup de Grâce rules do not work against Trainers or Pokémon simply due to Status Conditions such as Sleep or Paralysis; they must be either KO’d, or properly bound and made helpless.',
            '',
            'Furthermore, these Coup de Grâce rules are included for the sake of completeness when attempting to finish off a wounded opponent in the heat of battle; there’s no reason to force this mechanic outside of battle where a chance of failure does not make sense. All in all, use this rule at your GM’s discretion.',
        ];

        // Parse the text into embed messages
        const embeds = getPagedEmbedBuilders({
            title: 'Coup de Grâce',
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
