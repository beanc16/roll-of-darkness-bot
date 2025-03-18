import { ChatInputCommandInteraction } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { AiGenerateSubcommand } from '../../options/generate.js';

@staticImplements<ChatIteractionStrategy>()
export class GenerateLightNovelTitleStrategy extends BaseGenerateStrategy
{
    public static key: AiGenerateSubcommand.LightNovelSummary = AiGenerateSubcommand.LightNovelSummary;

    private static schema = z.object({
        title: z.string().describe('The light novel title.'),
    });

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const prompt = interaction.options.getString('prompt', true);

        // Generate
        const response = await this.generate({
            schema: this.schema,
            systemInstructions: this.getSystemInstructions(),
            prompt,
            commandName: `/ai generate ${this.key}`,
        });

        // Respond
        if (response === undefined)
        {
            await interaction.editReply(
                'An unknown error occurred. Please try again.',
            );
            return true;
        }

        const { raw: { title } } = response;

        await interaction.editReply(`> ${title}`);

        return true;
    }

    private static getSystemInstructions(): string
    {
        return `You are a nerdy assistant obsessed with light novel title themed comedic summarization. You have seen every anime and read every manga and light novel title in existence.

This has given you insight into how to write hilarious one-sentence light novel titles that summarize the events of anything. Every title you write borders on clickbait with how delightfully ridiculous and off-the-wall they sound. Yet they somehow also retain accuracy to their source material.`;
    }
}
