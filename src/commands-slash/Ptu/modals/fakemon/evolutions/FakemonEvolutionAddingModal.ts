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

enum FakemonEvolutionAddingCustomId
{
    Name = 'fakemon-evolution-adding-name',
    Level = 'fakemon-evolution-adding-level',
    Stage = 'fakemon-evolution-adding-stage',
    EvolutionCondition = 'fakemon-evolution-adding-evolution-condition',
}

enum FakemonEvolutionAddingLabel
{
    Name = 'Evolution Name',
    Level = 'Level',
    Stage = 'Stage',
    EvolutionCondition = 'Evolution Condition',
}

export class FakemonEvolutionAddingModal extends BaseCustomModal
{
    public static id = 'fakemon-add-evolution-modal';
    public static title = 'Add Evolution Stage';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonEvolutionAddingCustomId.Name]: [
            {
                key: FakemonEvolutionAddingCustomId.Name,
                label: FakemonEvolutionAddingLabel.Name,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonEvolutionAddingCustomId.Level]: [
            {
                key: FakemonEvolutionAddingCustomId.Level,
                label: FakemonEvolutionAddingLabel.Level,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonEvolutionAddingCustomId.Stage]: [
            {
                key: FakemonEvolutionAddingCustomId.Stage,
                label: FakemonEvolutionAddingLabel.Stage,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonEvolutionAddingCustomId.EvolutionCondition]: [
            {
                key: FakemonEvolutionAddingCustomId.EvolutionCondition,
                label: FakemonEvolutionAddingLabel.EvolutionCondition,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonEvolutionAddingCustomId.Name]: TextInputStyle.Short,
        [FakemonEvolutionAddingCustomId.Level]: TextInputStyle.Short,
        [FakemonEvolutionAddingCustomId.Stage]: TextInputStyle.Short,
        [FakemonEvolutionAddingCustomId.EvolutionCondition]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const nameInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionAddingCustomId.Name)
            .setLabel(FakemonEvolutionAddingLabel.Name)
            .setStyle(this.styleMap[FakemonEvolutionAddingCustomId.Name])
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(true);

        const levelInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionAddingCustomId.Level)
            .setLabel(FakemonEvolutionAddingLabel.Level)
            .setStyle(this.styleMap[FakemonEvolutionAddingCustomId.Level])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

        const stageInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionAddingCustomId.Stage)
            .setLabel(FakemonEvolutionAddingLabel.Stage)
            .setStyle(this.styleMap[FakemonEvolutionAddingCustomId.Stage])
            .setMinLength(1)
            .setMaxLength(1)
            .setRequired(true);

        const evolutionConditionInput = new TextInputBuilder()
            .setCustomId(FakemonEvolutionAddingCustomId.EvolutionCondition)
            .setLabel(FakemonEvolutionAddingLabel.EvolutionCondition)
            .setStyle(this.styleMap[FakemonEvolutionAddingCustomId.EvolutionCondition])
            .setPlaceholder('Dawn Stone Male / Dragon Scale / etc.')
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(false);

        return [
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
            [FakemonEvolutionAddingCustomId.Name]: name,
            [FakemonEvolutionAddingCustomId.Level]: level,
            [FakemonEvolutionAddingCustomId.Stage]: stage,
            [FakemonEvolutionAddingCustomId.EvolutionCondition]: evolutionCondition,
        } = this.parseInput<FakemonEvolutionAddingCustomId>(interaction) as {
            [FakemonEvolutionAddingCustomId.Name]: string;
            [FakemonEvolutionAddingCustomId.Level]: number;
            [FakemonEvolutionAddingCustomId.Stage]: number;
            [FakemonEvolutionAddingCustomId.EvolutionCondition]?: string;
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
            await FakemonEvolutionManagerService.addEvolutionStage({
                messageId,
                fakemon,
                name: name.trim(),
                level,
                stage,
                evolutionCondition: evolutionCondition?.trim(),
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
