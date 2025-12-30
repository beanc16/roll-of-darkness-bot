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
 * - overland
 * - swim
 * - sky
 * - levitate
 * - burrow
 */
export class FakemonNonOtherCapabilityEditingModal1 extends FakemonNonOtherCapabilityEditingModalBase
{
    public static id = 'fakemon-edit-non-other-capability-modal1';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonNonOtherCapabilityEditingCustomId.Overland]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.Overland,
                label: FakemonNonOtherCapabilityEditingLabel.Overland,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonNonOtherCapabilityEditingCustomId.Swim]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.Swim,
                label: FakemonNonOtherCapabilityEditingLabel.Swim,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonNonOtherCapabilityEditingCustomId.Sky]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.Sky,
                label: FakemonNonOtherCapabilityEditingLabel.Sky,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonNonOtherCapabilityEditingCustomId.Levitate]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.Levitate,
                label: FakemonNonOtherCapabilityEditingLabel.Levitate,
                value: '',
                typeOfValue: 'integer',
            },
        ],
        [FakemonNonOtherCapabilityEditingCustomId.Burrow]: [
            {
                key: FakemonNonOtherCapabilityEditingCustomId.Burrow,
                label: FakemonNonOtherCapabilityEditingLabel.Burrow,
                value: '',
                typeOfValue: 'integer',
            },
        ],
    };

    protected static styleMap = {
        [FakemonNonOtherCapabilityEditingCustomId.Overland]: TextInputStyle.Short,
        [FakemonNonOtherCapabilityEditingCustomId.Swim]: TextInputStyle.Short,
        [FakemonNonOtherCapabilityEditingCustomId.Sky]: TextInputStyle.Short,
        [FakemonNonOtherCapabilityEditingCustomId.Levitate]: TextInputStyle.Short,
        [FakemonNonOtherCapabilityEditingCustomId.Burrow]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        // Create inputs
        const overlandInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.Overland)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.Overland)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.Overland])
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true);

        const swimInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.Swim)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.Swim)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.Swim])
            .setMinLength(0)
            .setMaxLength(2)
            .setRequired(false);

        const skyInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.Sky)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.Sky)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.Sky])
            .setMinLength(0)
            .setMaxLength(2)
            .setRequired(false);

        const levitateInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.Levitate)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.Levitate)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.Levitate])
            .setMinLength(0)
            .setMaxLength(2)
            .setRequired(false);

        const burrowInput = new TextInputBuilder()
            .setCustomId(FakemonNonOtherCapabilityEditingCustomId.Burrow)
            .setLabel(FakemonNonOtherCapabilityEditingLabel.Burrow)
            .setStyle(this.styleMap[FakemonNonOtherCapabilityEditingCustomId.Burrow])
            .setMinLength(0)
            .setMaxLength(2)
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
            overland,
            swim,
            sky,
            levitate,
            burrow,
        } = fakemon.capabilities;
        if (Number.isSafeInteger(overland))
        {
            overlandInput.setValue(overland.toString());
        }
        if (swim !== undefined && Number.isSafeInteger(swim))
        {
            swimInput.setValue(swim.toString());
        }
        if (sky !== undefined && Number.isSafeInteger(sky))
        {
            skyInput.setValue(sky.toString());
        }
        if (levitate !== undefined && Number.isSafeInteger(levitate))
        {
            levitateInput.setValue(levitate.toString());
        }
        if (burrow !== undefined && Number.isSafeInteger(burrow))
        {
            burrowInput.setValue(burrow.toString());
        }

        return [
            overlandInput,
            swimInput,
            skyInput,
            levitateInput,
            burrowInput,
        ];
    }
}
