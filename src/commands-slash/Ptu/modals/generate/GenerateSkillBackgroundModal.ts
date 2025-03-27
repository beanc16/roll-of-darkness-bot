import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import type { InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import {
    BaseGenerateModal,
    type GenerateResponse,
    type HandlePaginatedChatResponsesInput,
} from '../../../../modals/BaseGenerateModal.js';

enum GenerateSkillBackgroundCustomId
{
    Prompt = 'prompt-text-input',
}

enum GenerateSkillBackgroundLabel
{
    Prompt = 'Response',
}

export class GenerateSkillBackgroundModal extends BaseGenerateModal
{
    public static id = 'generate-skill-background-modal';
    public static title = 'Generate Skill Backgrounds';
    protected static inputValuesMap: InputValuesMap = {
        [GenerateSkillBackgroundCustomId.Prompt]: [
            {
                key: GenerateSkillBackgroundCustomId.Prompt,
                label: GenerateSkillBackgroundLabel.Prompt,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [GenerateSkillBackgroundCustomId.Prompt]: TextInputStyle.Paragraph,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const promptInput = new TextInputBuilder()
            .setCustomId(GenerateSkillBackgroundCustomId.Prompt)
            .setLabel(GenerateSkillBackgroundLabel.Prompt)
            .setStyle(this.styleMap[GenerateSkillBackgroundCustomId.Prompt])
            .setMinLength(1)
            .setMaxLength(4000)
            .setRequired(true);

        return [promptInput];
    }

    public static async run(_interaction: ModalSubmitInteraction): Promise<void>
    {
        // No-op. Call generate with a buttonInteraction.awaitModalSubmit instead.
    }

    public static async generate(interaction: ModalSubmitInteraction): Promise <GenerateResponse>
    {
        // Parse input
        const previousInput = this.inputData as HandlePaginatedChatResponsesInput;
        const {
            [GenerateSkillBackgroundCustomId.Prompt]: {
                [GenerateSkillBackgroundCustomId.Prompt]: prompt,
            },
        } = this.parseInput<GenerateSkillBackgroundCustomId>(interaction) as {
            [GenerateSkillBackgroundCustomId.Prompt]: {
                [GenerateSkillBackgroundCustomId.Prompt]: string;
            };
        };

        // Generate response
        const response = await this.generateResponse(interaction, prompt);

        // Respond with error if response is undefined
        if (response === undefined)
        {
            return undefined;
        }

        // Update embed messages with new data
        const embeds = this.getUpdatedEmbeds(response, previousInput.embeds);

        // Respond with new data
        return { embeds };
    }
}
