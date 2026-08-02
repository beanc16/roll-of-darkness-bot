import { TextInputBuilder, TextInputStyle } from 'discord.js';

import { type InputValuesMap } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import {
    FakemonAbilityEditingCustomId,
    FakemonAbilityEditingLabel,
    FakemonAbilityEditingModalBase,
} from './FakemonAbilityEditingModalBase.js';

/**
 * Handles ability edits for the case of:
 * - 2 basic abilities
 * - 2 advanced abilities
 * - 1 high ability
 */
export class FakemonAbilityEditingModal1 extends FakemonAbilityEditingModalBase
{
    public static id = 'fakemon-edit-ability-modal1';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonAbilityEditingCustomId.BasicAbility1]: [
            {
                key: FakemonAbilityEditingCustomId.BasicAbility1,
                label: FakemonAbilityEditingLabel.BasicAbility1,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonAbilityEditingCustomId.BasicAbility2]: [
            {
                key: FakemonAbilityEditingCustomId.BasicAbility2,
                label: FakemonAbilityEditingLabel.BasicAbility2,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonAbilityEditingCustomId.AdvancedAbility1]: [
            {
                key: FakemonAbilityEditingCustomId.AdvancedAbility1,
                label: FakemonAbilityEditingLabel.AdvancedAbility1,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonAbilityEditingCustomId.AdvancedAbility2]: [
            {
                key: FakemonAbilityEditingCustomId.AdvancedAbility2,
                label: FakemonAbilityEditingLabel.AdvancedAbility2,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonAbilityEditingCustomId.HighAbility]: [
            {
                key: FakemonAbilityEditingCustomId.HighAbility,
                label: FakemonAbilityEditingLabel.HighAbility,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonAbilityEditingCustomId.BasicAbility1]: TextInputStyle.Short,
        [FakemonAbilityEditingCustomId.BasicAbility2]: TextInputStyle.Short,
        [FakemonAbilityEditingCustomId.AdvancedAbility1]: TextInputStyle.Short,
        [FakemonAbilityEditingCustomId.AdvancedAbility2]: TextInputStyle.Short,
        [FakemonAbilityEditingCustomId.HighAbility]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        // Create inputs
        const basicAbility1Input = new TextInputBuilder()
            .setCustomId(FakemonAbilityEditingCustomId.BasicAbility1)
            .setLabel(FakemonAbilityEditingLabel.BasicAbility1)
            .setStyle(this.styleMap[FakemonAbilityEditingCustomId.BasicAbility1])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false);

        const basicAbility2Input = new TextInputBuilder()
            .setCustomId(FakemonAbilityEditingCustomId.BasicAbility2)
            .setLabel(FakemonAbilityEditingLabel.BasicAbility2)
            .setStyle(this.styleMap[FakemonAbilityEditingCustomId.BasicAbility2])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false);

        const advancedAbility1Input = new TextInputBuilder()
            .setCustomId(FakemonAbilityEditingCustomId.AdvancedAbility1)
            .setLabel(FakemonAbilityEditingLabel.AdvancedAbility1)
            .setStyle(this.styleMap[FakemonAbilityEditingCustomId.AdvancedAbility1])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false);

        const advancedAbility2Input = new TextInputBuilder()
            .setCustomId(FakemonAbilityEditingCustomId.AdvancedAbility2)
            .setLabel(FakemonAbilityEditingLabel.AdvancedAbility2)
            .setStyle(this.styleMap[FakemonAbilityEditingCustomId.AdvancedAbility2])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false);

        const highAbilityInput = new TextInputBuilder()
            .setCustomId(FakemonAbilityEditingCustomId.HighAbility)
            .setLabel(FakemonAbilityEditingLabel.HighAbility)
            .setStyle(this.styleMap[FakemonAbilityEditingCustomId.HighAbility])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false);

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
        const {
            basicAbilities: [basicAbility1, basicAbility2],
            advancedAbilities: [advancedAbility1, advancedAbility2],
            highAbility,
        } = fakemon.abilities;
        if (basicAbility1 && basicAbility1.trim().toUpperCase() !== 'PLACEHOLDER')
        {
            basicAbility1Input.setValue(basicAbility1);
        }
        if (basicAbility2 && basicAbility2.trim().toUpperCase() !== 'PLACEHOLDER')
        {
            basicAbility2Input.setValue(basicAbility2);
        }
        if (advancedAbility1 && advancedAbility1.trim().toUpperCase() !== 'PLACEHOLDER')
        {
            advancedAbility1Input.setValue(advancedAbility1);
        }
        if (advancedAbility2 && advancedAbility2.trim().toUpperCase() !== 'PLACEHOLDER')
        {
            advancedAbility2Input.setValue(advancedAbility2);
        }
        if (highAbility && highAbility.trim().toUpperCase() !== 'PLACEHOLDER')
        {
            highAbilityInput.setValue(highAbility);
        }

        return [
            basicAbility1Input,
            basicAbility2Input,
            advancedAbility1Input,
            advancedAbility2Input,
            highAbilityInput,
        ];
    }
}
