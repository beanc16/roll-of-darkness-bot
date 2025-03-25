import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { InputValuesMap } from '../../../modals/BaseCustomModal.js';
import { BaseGenerateModal, type HandlePaginatedChatResponsesInput } from '../../../modals/BaseGenerateModal.js';
import { generatePlaygroundEmitter, GeneratePlaygroundEvent } from '../events/GeneratePlaygroundEmitter.js';

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

    public static async run(interaction: ModalSubmitInteraction): Promise <void>
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
        const response = await this.generate(interaction, prompt);

        // Respond with error if response is undefined
        if (response === undefined)
        {
            generatePlaygroundEmitter.emit(GeneratePlaygroundEvent.ResponseError, undefined);
            return;
        }

        // Update embed messages with new data
        const embeds = this.getUpdatedEmbeds(response, previousInput.embeds);

        // Respond with new data
        generatePlaygroundEmitter.emit(GeneratePlaygroundEvent.Response, { embeds });
    }
}
