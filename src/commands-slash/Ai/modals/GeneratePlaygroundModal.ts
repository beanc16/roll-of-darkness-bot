import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { InputValuesMap } from '../../../modals/BaseCustomModal.js';
import {
    BaseGenerateModal,
    type GenerateResponse,
    type HandlePaginatedChatResponsesInput,
} from '../../../modals/BaseGenerateModal.js';

enum GeneratePlaygroundCustomId
{
    Prompt = 'prompt-text-input',
}

enum GeneratePlaygroundLabel
{
    Prompt = 'Response',
}

export class GeneratePlaygroundModal extends BaseGenerateModal
{
    public static id = 'generate-playground-modal';
    public static title = 'Generate Playground';
    protected static inputValuesMap: InputValuesMap = {
        [GeneratePlaygroundCustomId.Prompt]: [
            {
                key: GeneratePlaygroundCustomId.Prompt,
                label: GeneratePlaygroundLabel.Prompt,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [GeneratePlaygroundCustomId.Prompt]: TextInputStyle.Paragraph,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const promptInput = new TextInputBuilder()
            .setCustomId(GeneratePlaygroundCustomId.Prompt)
            .setLabel(GeneratePlaygroundLabel.Prompt)
            .setStyle(this.styleMap[GeneratePlaygroundCustomId.Prompt])
            .setMinLength(1)
            .setMaxLength(4000)
            .setRequired(true);

        return [promptInput];
    }

    public static async run(_interaction: ModalSubmitInteraction): Promise<void>
    {
        // No-op. Call generate with a buttonInteraction.awaitModalSubmit instead.
    }

    public static async generate(interaction: ModalSubmitInteraction): Promise<GenerateResponse>
    {
        // Parse input
        const previousInput = this.inputData as HandlePaginatedChatResponsesInput;
        const {
            [GeneratePlaygroundCustomId.Prompt]: {
                [GeneratePlaygroundCustomId.Prompt]: prompt,
            },
        } = this.parseInput<GeneratePlaygroundCustomId>(interaction) as {
            [GeneratePlaygroundCustomId.Prompt]: {
                [GeneratePlaygroundCustomId.Prompt]: string;
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
