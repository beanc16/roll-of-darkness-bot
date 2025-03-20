import type { ChatInputCommandInteraction } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { AiDevGenerateSubcommand } from '../../options/generate_dev.js';
import { AiSubcommandGroup } from '../../options/index.js';

@staticImplements<ChatIteractionStrategy>()
export class GeneratePlaygroundStrategy extends BaseGenerateStrategy
{
    public static key: AiDevGenerateSubcommand.Playground = AiDevGenerateSubcommand.Playground;

    private static schema = z.object({
        response: z.string().describe('The response to the message.'),
    });

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const systemInstructions = interaction.options.getString('system_instructions');
        const prompt = interaction.options.getString('prompt');

        // Validate
        if (systemInstructions === null && prompt === null)
        {
            await interaction.editReply(
                'Please provide either a system instruction or a prompt.',
            );
            return true;
        }

        // Generate
        const response = await this.generate({
            schema: this.schema,
            systemInstructions,
            prompt,
            commandName: `/ai_dev generate ${this.key}`,
        });

        // Respond
        if (response === undefined)
        {
            await interaction.editReply(
                'An unknown error occurred. Please try again.',
            );
            return true;
        }

        await this.handlePaginatedChatResponses({
            originalInteraction: interaction,
            embeds: [
                this.getEmbed({ title: 'Playground', description: response.raw.response }),
            ],
            commandName: `/ai_dev ${AiSubcommandGroup.Generate} ${this.key}`,
            onRespondCallback: async () =>
            {
                const { raw } = await this.generate({
                    schema: this.schema,
                    systemInstructions,
                    prompt,
                    commandName: `/ai_dev generate ${this.key}`,
                }) ?? {};

                return raw?.response;
            },
        });

        return true;
    }
}
