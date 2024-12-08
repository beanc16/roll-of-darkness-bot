import { ChatInputCommandInteraction } from 'discord.js';

import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';

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
        const embeds = getPagedEmbedMessages({
            input: data,
            title: embedTitle,
            parseElementToLines: ({ formattedDescription }) => [formattedDescription],
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: `No ${embedTitle.toLowerCase()} were found.`,
        });
    }
}
