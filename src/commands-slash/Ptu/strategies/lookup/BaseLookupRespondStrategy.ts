import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

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

        // Send first embed
        await interaction.editReply({
            embeds: [embeds[0]],
        });

        // Reply to the original message with all embeds after the first
        for (const embed of embeds.slice(1))
        {
            await interaction.followUp({
                embeds: [embed],
            });
        }

        return true;
    }
}
