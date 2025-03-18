import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { AiDevGenerateSubcommand } from '../../options/generate_dev.js';

@staticImplements<ChatIteractionStrategy>()
export class GeneratePlaygroundStrategy extends BaseGenerateStrategy
{
    public static key: AiDevGenerateSubcommand.Playground = AiDevGenerateSubcommand.Playground;

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

        await interaction.editReply(response.raw);

        return true;
    }
}
