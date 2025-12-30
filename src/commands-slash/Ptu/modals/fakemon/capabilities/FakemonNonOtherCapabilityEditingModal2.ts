import { TextInputBuilder, TextInputStyle } from 'discord.js';

import { type InputValuesMap } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import {
    FakemonNonOtherCapabilityEditingCustomId,
    FakemonNonOtherCapabilityEditingLabel,
    FakemonNonOtherCapabilityEditingModalBase,
} from './FakemonNonOtherCapabilityEditingModalBase.js';

/**
 * Handles capability edits for:
 * - highJump
 * - lowJump
 * - power
 */
export class FakemonNonOtherCapabilityEditingModal2 extends FakemonNonOtherCapabilityEditingModalBase
{
    public static id = 'fakemon-edit-non-other-capability-modal2';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonNonOtherCapabilityEditingCustomId.HighJump]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.HighJump,
                label: FakemonNonOtherCapabilityEditingLabel.HighJump,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonNonOtherCapabilityEditingCustomId.LowJump]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.LowJump,
                label: FakemonNonOtherCapabilityEditingLabel.LowJump,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonNonOtherCapabilityEditingCustomId.Power]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.Power,
                label: FakemonNonOtherCapabilityEditingLabel.Power,
                value: '',
                typeOfValue: 'integer',
            },
        ],
    };

    protected static styleMap = {
        [FakemonNonOtherCapabilityEditingCustomId.HighJump]: TextInputStyle.Short,
        [FakemonNonOtherCapabilityEditingCustomId.LowJump]: TextInputStyle.Short,
        [FakemonNonOtherCapabilityEditingCustomId.Power]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        // Create inputs
        const highJumpInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.HighJump)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.HighJump)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.HighJump])
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true);

        const lowJumpInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.LowJump)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.LowJump)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.LowJump])
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true);

        const powerInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.Power)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.Power)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.Power])
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
        const {
            highJump,
            lowJump,
            power,
        } = fakemon.capabilities;
        if (Number.isSafeInteger(highJump))
        {
            highJumpInput.setValue(highJump.toString());
        }
        if (Number.isSafeInteger(lowJump))
        {
            lowJumpInput.setValue(lowJump.toString());
        }
        if (Number.isSafeInteger(power))
        {
            powerInput.setValue(power.toString());
        }

        return [
            highJumpInput,
            lowJumpInput,
            powerInput,
        ];
    }
}
