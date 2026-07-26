import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonOverviewManagerService } from '../../services/FakemonDataManagers/FakemonOverviewManagerService.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';

enum FakemonSpeciesNameEditingCustomId
{
    Name = 'fakemon-species-name-editing-text-input',
}

enum FakemonSpeciesNameEditingLabel
{
    Name = 'Name',
}

export class FakemonSpeciesNameEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-edit-species-name-modal';
    public static title = 'Edit Species Name';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonSpeciesNameEditingCustomId.Name]: [
            {
                key: FakemonSpeciesNameEditingCustomId.Name,
                label: FakemonSpeciesNameEditingLabel.Name,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonSpeciesNameEditingCustomId.Name]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const promptInput = new TextInputBuilder()
            .setCustomId(FakemonSpeciesNameEditingCustomId.Name)
            .setLabel(FakemonSpeciesNameEditingLabel.Name)
            .setStyle(this.styleMap[FakemonSpeciesNameEditingCustomId.Name])
            .setMinLength(1)
            .setMaxLength(40)
            .setRequired(true);

        const typedInputData = this.inputData as Partial<Record<'speciesName', string>>;
        if (
            typedInputData?.speciesName
            && typeof typedInputData.speciesName === 'string'
            && typedInputData?.speciesName?.length > 0
        )
        {
            promptInput.setValue(typedInputData.speciesName);
        }

        return [promptInput];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId } = this.inputData as { messageId: string };
        const {
            [FakemonSpeciesNameEditingCustomId.Name]: speciesName,
        } = this.parseInput<FakemonSpeciesNameEditingCustomId>(interaction) as {
            [FakemonSpeciesNameEditingCustomId.Name]: string;
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
            await FakemonOverviewManagerService.setSpeciesName({
                messageId,
                fakemon,
                speciesName,
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
            page: FakemonInteractionManagerPage.Overview,
            messageId,
        });
    }
}
