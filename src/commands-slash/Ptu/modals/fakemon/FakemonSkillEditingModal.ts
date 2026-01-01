import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { FakemonSkillsEditStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/FakemonSkillsEditStringSelectActionRowBuilder.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonSkillManagerService } from '../../services/FakemonDataManagers/FakemonSkillManagerService.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';

enum FakemonSkillEditingCustomId
{
    SkillDice = 'fakemon-skill-dice-editing-text-input',
    SkillModifier = 'fakemon-skill-modifier-editing-text-input',
}

enum FakemonSkillEditingLabel
{
    SkillDice = 'Skill Dice (1 - 6)',
    SkillModifier = 'Skill Modifier (-6 - 6)',
}

export class FakemonSkillEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-edit-skill-modal';
    public static title = 'Edit Skill';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonSkillEditingCustomId.SkillDice]: [
            {
                key: FakemonSkillEditingCustomId.SkillDice,
                label: FakemonSkillEditingLabel.SkillDice,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonSkillEditingCustomId.SkillModifier]: [
            {
                key: FakemonSkillEditingCustomId.SkillModifier,
                label: FakemonSkillEditingLabel.SkillModifier,
                value: '',
                typeOfValue: 'integer',
            },
        ],
    };

    protected static styleMap = {
        [FakemonSkillEditingCustomId.SkillDice]: TextInputStyle.Short,
        [FakemonSkillEditingCustomId.SkillModifier]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const skillDiceInput = new TextInputBuilder()
            .setCustomId(FakemonSkillEditingCustomId.SkillDice)
            .setLabel(FakemonSkillEditingLabel.SkillDice)
            .setStyle(this.styleMap[FakemonSkillEditingCustomId.SkillDice])
            .setMinLength(1)
            .setMaxLength(1)
            .setRequired(true);

        const skillModifierInput = new TextInputBuilder()
            .setCustomId(FakemonSkillEditingCustomId.SkillModifier)
            .setLabel(FakemonSkillEditingLabel.SkillModifier)
            .setStyle(this.styleMap[FakemonSkillEditingCustomId.SkillModifier])
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true);

        const typedInputData = this.inputData as Partial<Record<'skillDice' | 'skillModifier', number>>;
        if (typedInputData?.skillDice !== undefined && typedInputData?.skillDice?.toString())
        {
            skillDiceInput.setValue(typedInputData.skillDice.toString());
        }
        if (typedInputData?.skillModifier !== undefined && typedInputData?.skillModifier?.toString())
        {
            skillModifierInput.setValue(typedInputData.skillModifier.toString());
        }

        return [skillDiceInput, skillModifierInput];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId, skillToEdit } = this.inputData as {
            messageId: string;
            skillToEdit: FakemonSkillsEditStringSelectElementOptions;
        };
        const { [FakemonSkillEditingCustomId.SkillDice]: skillDice, [FakemonSkillEditingCustomId.SkillModifier]: skillModifier } = this.parseInput<FakemonSkillEditingCustomId>(interaction) as {
            [FakemonSkillEditingCustomId.SkillDice]: number;
            [FakemonSkillEditingCustomId.SkillModifier]: number;
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
            await FakemonSkillManagerService.setSkill({
                messageId,
                fakemon,
                skillDice,
                skillModifier,
                skillToEdit,
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
            page: FakemonInteractionManagerPage.Skills,
            messageId,
        });
    }
}
