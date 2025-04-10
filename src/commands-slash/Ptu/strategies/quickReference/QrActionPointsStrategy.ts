import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedBuilders } from '../../../embed-messages/shared.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class QrActionPointsStrategy
{
    public static key: PtuQuickReferenceInfo.ActionPoints = PtuQuickReferenceInfo.ActionPoints;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Create the lines of the embed message
        const lines = [
            `${Text.bold('What are Action Points')}:`,
            'Actions Points (AP) are a resource used by Trainers to fuel special actions through Features.',
            '',
            `${Text.bold('Maximum Action Points')}:`,
            'Trainers have a maximum Action Point pool equal to 5, plus 1 more for every 5 Trainer Levels they have achieved.',
            '',
            `${Text.bold('Spent Action Points')}:`,
            'Spent Action Points are consumed, then completed regained at the end of each Scene.',
            '',
            `${Text.bold('Bound Action Points')}:`,
            [
                'Bound Action Points remain off-limits until the effect that Bound them ends, as specified by the Feature or effect.',
                'If no means of ending the effect is specified, then the effect may be ended with the AP becoming Unbound during your turn as a Free Action.',
            ].join(' '),
            '',
            `${Text.bold('Drained Action Points')}:`,
            'Drained Action Points become unavailable for use until after an Extended Rest is taken.',
            '',
            `${Text.bold('Modifying Rolls')}:`,
            'Trainers may spend 1 Action Point as a Free Action before they or their Pokemon make an Accuracy Roll or Skill Check to add +1 to the result. This cannot be done more than once per roll.',
        ];

        // Parse the text into embed messages
        const embeds = getPagedEmbedBuilders({
            title: 'Action Types',
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
