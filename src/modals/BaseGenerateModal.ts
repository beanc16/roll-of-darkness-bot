import {
    type ChatInputCommandInteraction,
    EmbedBuilder,
    type ModalSubmitInteraction,
} from 'discord.js';

import { CommandName } from '../types/discord.js';
import { BaseCustomModal } from './BaseCustomModal.js';

export interface HandlePaginatedChatResponsesInput<CallbackResponse = string>
{
    Modal: typeof BaseGenerateModal;
    originalInteraction: ChatInputCommandInteraction;
    embeds: EmbedBuilder[];
    commandName: CommandName;
    generateResponseCallback: (newPrompt: string) => Promise<CallbackResponse | undefined>;
}

export type GenerateResponse = {
    embeds: EmbedBuilder[];
} | undefined;

export class BaseGenerateModal extends BaseCustomModal
{
    // eslint-disable-next-line @typescript-eslint/require-await -- This is a base class, this method will be overwritten by children.
    public static async generate(_interaction: ModalSubmitInteraction): Promise<GenerateResponse>
    {
        throw new Error(`${this.constructor.name}.generate has not yet been implemented`);
    }

    protected static async generateResponse<CallbackResponse = string>(interaction: ModalSubmitInteraction, prompt: string): Promise<CallbackResponse | undefined>
    {
        // Send message to show the command was received
        await interaction.deferUpdate({
            fetchReply: true,
        });
        await interaction.followUp({
            content: 'Generating response, please wait...',
            ephemeral: true,
        });

        const { generateResponseCallback } = this.inputData as HandlePaginatedChatResponsesInput<CallbackResponse>;

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
