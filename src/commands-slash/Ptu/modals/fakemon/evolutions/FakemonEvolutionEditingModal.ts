import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import { FakemonEvolutionManagerService } from '../../../services/FakemonDataManagers/FakemonEvolutionManagerService.js';
import { FakemonInteractionManagerService } from '../../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';

enum FakemonEvolutionEditingCustomId
{
    PreviousName = 'fakemon-evolution-editing-previous-name',
    Name = 'fakemon-evolution-editing-name',
    Level = 'fakemon-evolution-editing-level',
    Stage = 'fakemon-evolution-editing-stage',
    EvolutionCondition = 'fakemon-evolution-editing-evolution-condition',
}

enum FakemonEvolutionEditingLabel
{
    PreviousName = 'Previous Evolution Name',
    Name = 'New Evolution Name',
    Level = 'New Level',
    Stage = 'New Stage',
    EvolutionCondition = 'New Evolution Condition',
}

export class FakemonEvolutionEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-edit-evolution-modal';
    public static title = 'Edit Evolution Stage';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonEvolutionEditingCustomId.PreviousName]: [
            {
                key: FakemonEvolutionEditingCustomId.PreviousName,
                label: FakemonEvolutionEditingLabel.PreviousName,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonEvolutionEditingCustomId.Name]: [
            {
                key: FakemonEvolutionEditingCustomId.Name,
                label: FakemonEvolutionEditingLabel.Name,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonEvolutionEditingCustomId.Level]: [
            {
                key: FakemonEvolutionEditingCustomId.Level,
                label: FakemonEvolutionEditingLabel.Level,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonEvolutionEditingCustomId.Stage]: [
            {
                key: FakemonEvolutionEditingCustomId.Stage,
                label: FakemonEvolutionEditingLabel.Stage,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonEvolutionEditingCustomId.EvolutionCondition]: [
            {
                key: FakemonEvolutionEditingCustomId.EvolutionCondition,
                label: FakemonEvolutionEditingLabel.EvolutionCondition,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonEvolutionEditingCustomId.PreviousName]: TextInputStyle.Short,
        [FakemonEvolutionEditingCustomId.Name]: TextInputStyle.Short,
        [FakemonEvolutionEditingCustomId.Level]: TextInputStyle.Short,
        [FakemonEvolutionEditingCustomId.Stage]: TextInputStyle.Short,
        [FakemonEvolutionEditingCustomId.EvolutionCondition]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const previousNameInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionEditingCustomId.PreviousName)
            .setLabel(FakemonEvolutionEditingLabel.PreviousName)
            .setStyle(this.styleMap[FakemonEvolutionEditingCustomId.PreviousName])
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(true);

        const nameInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionEditingCustomId.Name)
            .setLabel(FakemonEvolutionEditingLabel.Name)
            .setStyle(this.styleMap[FakemonEvolutionEditingCustomId.Name])
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(true);

        const levelInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionEditingCustomId.Level)
            .setLabel(FakemonEvolutionEditingLabel.Level)
            .setStyle(this.styleMap[FakemonEvolutionEditingCustomId.Level])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

        const stageInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionEditingCustomId.Stage)
            .setLabel(FakemonEvolutionEditingLabel.Stage)
            .setStyle(this.styleMap[FakemonEvolutionEditingCustomId.Stage])
            .setMinLength(1)
            .setMaxLength(1)
            .setRequired(true);

        const evolutionConditionInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionEditingCustomId.EvolutionCondition)
            .setLabel(FakemonEvolutionEditingLabel.EvolutionCondition)
            .setStyle(this.styleMap[FakemonEvolutionEditingCustomId.EvolutionCondition])
            .setPlaceholder('Dawn Stone Male / Dragon Scale / etc.')
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(false);

        // Get fakemon
        const { messageId, previousName } = this.inputData as {
            messageId: string;
            previousName: string;
        };
        const fakemon = PtuFakemonPseudoCache.getByMessageId(messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // Get evolution stage
        const { evolution } = fakemon;
        const evolutionStage = evolution.find((curEvolutionStage) => curEvolutionStage.name.includes(previousName.trim()));
        if (!evolutionStage)
        {
            throw new Error('Evolution stage not found');
        }

        // Get evolution condition
        const evolutionCondition = FakemonEvolutionManagerService.extractEvolutionConditionFromName(
            previousName,
            evolutionStage,
        );

        // Set default values
        previousNameInput.setValue(evolutionStage.name);
        nameInput.setValue(evolutionStage.name);
        levelInput.setValue(evolutionStage.level.toString());
        stageInput.setValue(evolutionStage.stage.toString());
        evolutionConditionInput.setValue(evolutionCondition || '');

        return [
            previousNameInput,
            nameInput,
            levelInput,
            stageInput,
            evolutionConditionInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId } = this.inputData as {
            messageId: string;
        };
        const {
            [FakemonEvolutionEditingCustomId.PreviousName]: previousName,
            [FakemonEvolutionEditingCustomId.Name]: name,
            [FakemonEvolutionEditingCustomId.Level]: level,
            [FakemonEvolutionEditingCustomId.Stage]: stage,
            [FakemonEvolutionEditingCustomId.EvolutionCondition]: evolutionCondition,
        } = this.parseInput<FakemonEvolutionEditingCustomId>(interaction) as {
            [FakemonEvolutionEditingCustomId.PreviousName]: string;
            [FakemonEvolutionEditingCustomId.Name]: string;
            [FakemonEvolutionEditingCustomId.Level]: number;
            [FakemonEvolutionEditingCustomId.Stage]: number;
            [FakemonEvolutionEditingCustomId.EvolutionCondition]?: string;
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
            await FakemonEvolutionManagerService.editEvolutionStage({
                messageId,
                fakemon,
                previousName,
                new: {
                    name: name.trim(),
                    level,
                    stage,
                    evolutionCondition: evolutionCondition?.trim(),
                },
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
            page: FakemonInteractionManagerPage.Evolutions,
            messageId,
        });
    }
}
