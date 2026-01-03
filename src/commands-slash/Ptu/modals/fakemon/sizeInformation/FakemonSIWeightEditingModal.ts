import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import { FakemonSizeManagerService } from '../../../services/FakemonDataManagers/FakemonSizeManagerService.js';
import { FakemonInteractionManagerService } from '../../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';

enum FakemonWeightEditingCustomId
{
    Pounds = 'fakemon-lb-editing-text-input',
}

enum FakemonWeightEditingLabel
{
    Pounds = 'Pounds (lbs)',
}

export class FakemonSIWeightEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-si-edit-weight-modal';
    public static title = 'Edit Weight';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonWeightEditingCustomId.Pounds]: [
            {
                key: FakemonWeightEditingCustomId.Pounds,
                label: FakemonWeightEditingLabel.Pounds,
                value: '',
                typeOfValue: 'float',
            },
        ],
    };

    protected static styleMap = {
        [FakemonWeightEditingCustomId.Pounds]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const poundsInput = new TextInputBuilder()
            .setCustomId(FakemonWeightEditingCustomId.Pounds)
            .setLabel(FakemonWeightEditingLabel.Pounds)
            .setStyle(this.styleMap[FakemonWeightEditingCustomId.Pounds])
            .setMinLength(1)
            .setMaxLength(6)
            .setRequired(true);

        // Get fakemon
        const { messageId } = this.inputData as {
            messageId: string;
        };
        const fakemon = PtuFakemonPseudoCache.getByMessageId(messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // Set default values
        const poundsAsString = fakemon.sizeInformation.weight.freedom.replaceAll('lbs', '').replaceAll('lb', '');
        const pounds = parseFloat(poundsAsString);
        if (!(pounds === undefined || Number.isNaN(pounds)))
        {
            poundsInput.setValue(pounds.toString());
        }

        return [poundsInput];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId } = this.inputData as {
            messageId: string;
        };
        const {
            [FakemonWeightEditingCustomId.Pounds]: lbs,
        } = this.parseInput<FakemonWeightEditingCustomId>(interaction) as {
            [FakemonWeightEditingCustomId.Pounds]: number;
        };

        // Get fakemon
        const fakemon = PtuFakemonPseudoCache.getByMessageId(messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // Defer update to allow for database transaction
        await interaction.deferUpdate();

        // Update database
        try
        {
            await FakemonSizeManagerService.setWeight({
                messageId,
                fakemon,
                lbs,
            });
        }
        catch (error)
        {
            const errorMessage = (error as Error)?.message;
            await interaction.followUp({
                content: [
                    `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                    ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                ].join('\n'),
                ephemeral: true,
            });
            return;
        }

        // Update message
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.SizeInformation,
            messageId,
        });
    }
}
