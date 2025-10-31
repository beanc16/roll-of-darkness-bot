import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedMessages, paginateCsv } from '../../../embed-messages/shared.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import { PaginationStrategy } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { PtuGenerateSubcommand } from '../../options/generate.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class GenerateAbilityNamesStrategy extends BaseGenerateStrategy
{
    public static key: PtuGenerateSubcommand.AbilityNames = PtuGenerateSubcommand.AbilityNames;
    public static schema = z.object({
        abilityNames: z.array(
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
        const numOfAbilities = interaction.options.getInteger('number_of_abilities') || 10;
        const shouldIncludeDescriptions = interaction.options.getBoolean('include_descriptions') || false;

        // Generate
        const response = await this.generate({
            schema: this.schema,
            systemInstructions: this.getSystemInstructions(numOfAbilities),
            prompt: [
                prompt,
                ...(shouldIncludeDescriptions
                    ? [
                        '',
                        `Include a concise sentence evocatively describing how each ability would be flavored.`,
                    ]
                    : []),
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

        const embeds = this.getEmbeds(response.raw.abilityNames);
        await PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
            embeds,
        });

        /* TODO: Uncomment once chat history is added
        await this.handlePaginatedChatResponses({
            Modal: GenerateAbilityNamesBackgroundModal,
            originalInteraction: interaction,
            embeds: [
                this.getEmbed({ title: 'Ability Names', description: responseString }),
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

                return this.getResponseString(newResponse.raw.abilityNames));
            },
        });
        */

        return true;
    }

    /* istanbul ignore next */
    private static getSystemInstructions(numOfAbilities: number): string
    {
        return `You are a Pokémon ability name generator. Your role is to brainstorm creative, authentic-sounding Pokémon ability names that fit seamlessly with the official games.

**Guidelines:**
- Generate ability names that sound official and could plausibly exist in the Pokémon franchise
- Keep names to 1-2 words unless the user specifies otherwise
- Provide a short list of ${numOfAbilities} options per request
- When creating variations of existing abilities (e.g., "a Poison-type version of Snow Warning"), ensure the new names match the tone, structure, and feel of the original ability so they sound related
- Consider the ability's type, concept, and any descriptive details the user provides
- Names should be punchy, memorable, and evocative of the ability's effect or type

**Output format:**
- Present names as a simple bulleted list
- No descriptions, stats, or additional details unless requested
- Focus solely on the naming
- If the user asks for flavor descriptions or explanations of how the ability would look/work when used, include a brief description after each ability name explaining the visual or thematic flavor of the ability

When the user describes a ability concept or asks for type variations, generate names that capture the essence while maintaining that authentic Pokémon feel.`;
    }

    private static getEmbeds(abilityNames: z.infer<typeof this.schema>['abilityNames']): EmbedBuilder[]
    {
        const abilityNamesOutput = abilityNames.reduce((acc, { name, description }, index) =>
        {
            const lineBreak = (index === 0) ? '' : '\n';
            return acc + `${lineBreak}${index + 1}. ${name}${description ? `: ${description}` : ''}`;
        }, '');

        const paginatedResponse = paginateCsv({ input: abilityNamesOutput });

        return getPagedEmbedMessages({
            input: paginatedResponse,
            title: 'Ability Names:',
            parseElementToLines: element => [element],
        });
    }
}
