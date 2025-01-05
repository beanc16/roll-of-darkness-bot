import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQrBookMechanicsEmbedMessages } from '../../embed-messages/quickReference.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class QrBookMechanicsStrategy
{
    public static key: PtuQuickReferenceInfo.BookMechanics = PtuQuickReferenceInfo.BookMechanics;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Create the lines of the embed message
        const lines = [
            'Books hold knowledge, and knowledge is power! Books are Items associated with Education Skills that can be used during Extended Actions to Drain your AP to receive certain benefits.',
            '',
            'After half an hour of study, you can Drain 1 AP to gain the benefits of one Rank of a Book , if you meet the prerequisite Skill for that Book’s Rank. Ranks in an individual book must be gained sequentially (e.g. you must have the Novice Rank effect to gain the the Expert Rank effect).',
            '',
            'The benefits from a Book last until an Extended Rest is taken; when an Extended Rest is taken, you may choose to renew any Drain previously held from Books and continue to gain the effects.',
            '',
            'Books generally cost $1000, but some prices may vary.',
        ];

        // Parse the text into embed messages
        const embeds = getQrBookMechanicsEmbedMessages(lines);

        // Send the embed messages
        await interaction.editReply({
            embeds,
        });

        return true;
    }
}
