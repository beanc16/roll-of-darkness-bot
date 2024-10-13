import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { PaginationStrategy } from '../../../strategies/PaginationStrategy.js';

export class BaseLookupRespondStrategy
{
    static async run(
        interaction: ChatInputCommandInteraction,
        embeds: EmbedBuilder[],
        options: {
            noEmbedsErrorMessage: string;
        },
    ): Promise<boolean>
    {
        // Send no results found
        if (embeds.length === 0)
        {
            await interaction.editReply(options.noEmbedsErrorMessage);
            return true;
        }

        // Send messages with pagination (fire and forget)
        PaginationStrategy.run({
            originalInteraction: interaction,
            embeds,
        });

        return true;
    }
}
