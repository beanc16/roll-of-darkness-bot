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

enum FakemonHeightEditingCustomId
{
    Feet = 'fakemon-feet-editing-text-input',
    Inches = 'fakemon-inches-editing-text-input',
}

enum FakemonHeightEditingLabel
{
    Feet = 'Feet',
    Inches = 'Inches',
}

export class FakemonSIHeightEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-si-edit-height-modal';
    public static title = 'Edit Height';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonHeightEditingCustomId.Feet]: [
            {
                key: FakemonHeightEditingCustomId.Feet,
                label: FakemonHeightEditingLabel.Feet,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonHeightEditingCustomId.Inches]: [
            {
                key: FakemonHeightEditingCustomId.Inches,
                label: FakemonHeightEditingLabel.Inches,
                value: '',
                typeOfValue: 'integer',
            },
        ],
    };

    protected static styleMap = {
        [FakemonHeightEditingCustomId.Feet]: TextInputStyle.Short,
        [FakemonHeightEditingCustomId.Inches]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const feetInput = new TextInputBuilder()
            .setCustomId(FakemonHeightEditingCustomId.Feet)
            .setLabel(FakemonHeightEditingLabel.Feet)
            .setStyle(this.styleMap[FakemonHeightEditingCustomId.Feet])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

        const inchesInput = new TextInputBuilder()
            .setCustomId(FakemonHeightEditingCustomId.Inches)
            .setLabel(FakemonHeightEditingLabel.Inches)
            .setStyle(this.styleMap[FakemonHeightEditingCustomId.Inches])
            .setMinLength(1)
            .setMaxLength(2)
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
        const { feet, inches } = FakemonSizeManagerService.getHeightFromString(fakemon.sizeInformation.height.freedom);
        if (feet !== undefined)
        {
            feetInput.setValue(feet.toString());
        }
        if (inches !== undefined)
        {
            inchesInput.setValue(inches.toString());
        }

        return [feetInput, inchesInput];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId } = this.inputData as {
            messageId: string;
        };
        const { [FakemonHeightEditingCustomId.Feet]: ft, [FakemonHeightEditingCustomId.Inches]: inches } = this.parseInput<FakemonHeightEditingCustomId>(interaction) as {
            [FakemonHeightEditingCustomId.Feet]: number;
            [FakemonHeightEditingCustomId.Inches]: number;
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
            await FakemonSizeManagerService.setHeight({
                messageId,
                fakemon,
                ft,
                inches,
            });
        }
        catch (error)
        {
            const errorMessage = (error as Error)?.message;
            await interaction.followUp({
                content: [
                    `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                    ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
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
