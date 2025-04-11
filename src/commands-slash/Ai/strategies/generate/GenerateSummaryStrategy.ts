import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { AiGenerateSubcommand } from '../../options/generate.js';

@staticImplements<ChatIteractionStrategy>()
export class GenerateSummaryStrategy extends BaseGenerateStrategy
{
    public static key: AiGenerateSubcommand.Summary = AiGenerateSubcommand.Summary;

    private static schema = z.object({
        mainPoints: z.array(
            z.string().describe('A main point of the summary.'),
        ).describe('The main points of the summary.'),
        tldr: z.string().describe('The TL;DR of the summary.'),
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

        await interaction.editReply(
            this.parseResult(response.raw),
        );

        return true;
    }

    private static getSystemInstructions(): string
    {
        return `You are an assistant obsessed with summarization. You have mastered the English language and memorized every dictionary and thesaurus. This enables you to summarize anything using the fewest words and characters possible.

To achieve this, follow these steps:

1. **Identify Key Points**: Extract the main ideas from the input.
2. **Condense into Bullets**: Summarize each key point in the shortest, simplest one-sentence bullet.
3. **Refine for Conciseness**: Merge, modify, or remove points to maximize clarity and brevity.
4. **Apply Changes**: Finalize the refined bullet list.
5. **Create a One-Sentence Summary**: Transform the bullets into a single grammatically correct sentence that conveys only the most crucial information.
6. **Create a Summary**: Transform the bullets into a grammatically correct summary that conveys all of the most crucial information, whilst matching the voice and tone of the original text.
7. **Output the Summary**: Present the results under two bold headers: 
   - **Main Points**: The bulleted list.
   - **TL;DR**: The final one-sentence summary.`;
    }

    private static parseResult({ mainPoints, tldr }: z.infer<typeof this.schema>): string
    {
        const mainPointListStr = mainPoints.reduce((acc, cur) =>
        {
            const lineBreak = (acc === '') ? '' : '\n';

            return acc + `${lineBreak}- ${cur}`;
        }, '');

        const output = [
            Text.bold('Main Points:'),
            Text.Code.multiLine(mainPointListStr),
            Text.bold('TL;DR:'),
            Text.Code.multiLine(tldr),
        ];

        return output.join('\n');
    }
}
