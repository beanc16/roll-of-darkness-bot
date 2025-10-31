import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import { PtuGenerateSubcommand } from '../../options/generate.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';
import { getPagedEmbedMessages, paginateCsv } from '../../../embed-messages/shared.js';
import { PaginationStrategy } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';

@staticImplements<PtuChatIteractionStrategy>()
export class GenerateMoveNamesStrategy extends BaseGenerateStrategy
{
    public static key: PtuGenerateSubcommand.MoveNames = PtuGenerateSubcommand.MoveNames;
    public static schema = z.object({
        moveNames: z.array(
            z.object({
                name: z.string(),
                description: z.string().optional(),
            }),
        ),
    });

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const prompt = interaction.options.getString('prompt', true);
        const numOfMoves = interaction.options.getInteger('number_of_moves') || 10;
        const shouldIncludeDescriptions = interaction.options.getBoolean('include_descriptions') || false;

        // Generate
        const response = await this.generate({
            schema: this.schema,
            systemInstructions: this.getSystemInstructions(numOfMoves),
            prompt: [
                prompt,
                ...(shouldIncludeDescriptions ? [
                    '',
                    `Include a concise sentence evocatively describing how each move would be flavored.`,
                ] : []),
            ].join('\n'),
            commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
        });

        // Respond
        if (response === undefined)
        {
            await interaction.editReply(
                'An unknown error occurred. Please try again.',
            );
            return true;
        }

        const embeds = this.getEmbeds(response.raw.moveNames);
        await PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
            embeds,
        });

        /* TODO: Uncomment once chat history is added
        await this.handlePaginatedChatResponses({
            Modal: GenerateMoveNamesBackgroundModal,
            originalInteraction: interaction,
            embeds: [
                this.getEmbed({ title: 'Move Names', description: responseString }),
            ],
            commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
            generateResponseCallback: async (newPrompt) =>
            {
                const newResponse = await this.generate({
                    schema: this.schema,
                    systemInstructions: this.getSystemInstructions(),
                    prompt: newPrompt,
                    commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
                });

                return this.getResponseString(newResponse.raw.moveNames));
            },
        });
        */

        return true;
    }

    /* istanbul ignore next */
    private static getSystemInstructions(numOfMoves: number): string
    {
        return `You are a Pokémon move name generator. Your role is to brainstorm creative, authentic-sounding Pokémon move names that fit seamlessly with the official games.

**Guidelines:**
- Generate move names that sound official and could plausibly exist in the Pokémon franchise
- Keep names to 1-2 words unless the user specifies otherwise
- Provide a short list of ${numOfMoves} options per request
- When creating variations of existing moves (e.g., "a Fairy-type version of Shadow Ball"), ensure the new names match the tone, structure, and feel of the original move so they sound related
- Consider the move's type, concept, and any descriptive details the user provides
- Names should be punchy, memorable, and evocative of the move's effect or type

**Output format:**
- Present names as a simple bulleted list
- No descriptions, stats, or additional details unless requested
- Focus solely on the naming
- If the user asks for flavor descriptions or explanations of how the move would look/work when used, include a brief description after each move name explaining the visual or thematic flavor of the move

When the user describes a move concept or asks for type variations, generate names that capture the essence while maintaining that authentic Pokémon feel.`;
    }

    private static getEmbeds(moveNames: z.infer<typeof this.schema>['moveNames']): EmbedBuilder[]
    {
        const moveNamesOutput = moveNames.reduce((acc, { name, description }, index) =>
        {
            const lineBreak = (index === 0) ? '' : '\n';
            return acc + `${lineBreak}${index + 1}. ${name}${description ? `: ${description}` : ''}`;
        }, '');

        const paginatedResponse = paginateCsv({ input: moveNamesOutput });

        return getPagedEmbedMessages({
            input: paginatedResponse,
            title: 'Move Names:',
            parseElementToLines: element => [element],
        });
    }
}
