import {
    type ChatInputCommandInteraction,
    EmbedBuilder,
    type ModalSubmitInteraction,
} from 'discord.js';

import { CommandName } from '../types/discord.js';
import { BaseCustomModal } from './BaseCustomModal.js';

export interface HandlePaginatedChatResponsesInput
{
    Modal: typeof BaseGenerateModal;
    originalInteraction: ChatInputCommandInteraction;
    embeds: EmbedBuilder[];
    commandName: CommandName;
    generateResponseCallback: (newPrompt: string) => Promise<string | undefined>;
}

export class BaseGenerateModal extends BaseCustomModal
{
    protected static async generate(interaction: ModalSubmitInteraction, prompt: string): Promise<string | undefined>
    {
        // Send message to show the command was received
        await interaction.deferUpdate({
            fetchReply: true,
        });
        await interaction.followUp({
            content: 'Generating response, please wait...',
            ephemeral: true,
        });

        const { generateResponseCallback } = this.inputData as HandlePaginatedChatResponsesInput;

        const response = await generateResponseCallback(prompt);

        if (response === undefined)
        {
            await interaction.followUp({
                content: 'An unknown error occurred. Please try again.',
                ephemeral: true,
            });
        }

        return response;
    }

    protected static getUpdatedEmbeds(responseText: string, embeds: EmbedBuilder[]): EmbedBuilder[]
    {
        const pages = [
            responseText,
            ...embeds.map(embed => embed.data.description),
        ];

        return pages.map((description, index) =>
        {
            const embed = new EmbedBuilder({
                title: embeds[0].data.title!,
                description: description!,
                color: 0xCDCDCD,
            });

            if (pages.length > 1)
            {
                embed.setFooter({ text: `Page ${index + 1}/${pages.length}` });
            }

            return embed;
        });
    }
}
