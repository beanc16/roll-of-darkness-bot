import { ChatInputCommandInteraction } from 'discord.js';

import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { getLookupCurseborneEmbedMessages } from '../../embed-messages/lookup.js';

export class BaseCurseborneLookupStrategy
{
    public static async run<ClassInstance extends { formattedDescription: string }>({
        interaction,
        data,
        embedTitle,
    }: {
        interaction: ChatInputCommandInteraction;
        data: ClassInstance[];
        embedTitle: string;
    }): Promise<boolean>
    {
        const embeds = getLookupCurseborneEmbedMessages({
            data,
            title: embedTitle,
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: `No ${embedTitle.toLowerCase()} were found.`,
        });
    }
}
