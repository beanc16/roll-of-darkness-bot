import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import { FakemonCapabilityManagerService } from '../../../services/FakemonDataManagers/FakemonCapabilityManagerService.js';
import { FakemonInteractionManagerService } from '../../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';

enum FakemonOtherCapabilityAddingCustomId
{
    Capability1 = 'fakemon-other-capability-1',
    Capability2 = 'fakemon-other-capability-2',
    Capability3 = 'fakemon-other-capability-3',
    Capability4 = 'fakemon-other-capability-4',
    Capability5 = 'fakemon-other-capability-5',
}

enum FakemonOtherCapabilityAddingLabel
{
    Capability1 = 'Capability 1',
    Capability2 = 'Capability 2',
    Capability3 = 'Capability 3',
    Capability4 = 'Capability 4',
    Capability5 = 'Capability 5',
}

export class FakemonOtherCapabilityAddingModal extends BaseCustomModal
{
    public static id = 'fakemon-add-other-capability-modal';
    public static title = 'Add Other Capabilities';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonOtherCapabilityAddingCustomId.Capability1]: [
            {
                key: FakemonOtherCapabilityAddingCustomId.Capability1,
                label: FakemonOtherCapabilityAddingLabel.Capability1,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonOtherCapabilityAddingCustomId.Capability2]: [
            {
                key: FakemonOtherCapabilityAddingCustomId.Capability2,
                label: FakemonOtherCapabilityAddingLabel.Capability2,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonOtherCapabilityAddingCustomId.Capability3]: [
            {
                key: FakemonOtherCapabilityAddingCustomId.Capability3,
                label: FakemonOtherCapabilityAddingLabel.Capability3,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonOtherCapabilityAddingCustomId.Capability4]: [
            {
                key: FakemonOtherCapabilityAddingCustomId.Capability4,
                label: FakemonOtherCapabilityAddingLabel.Capability4,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonOtherCapabilityAddingCustomId.Capability5]: [
            {
                key: FakemonOtherCapabilityAddingCustomId.Capability5,
                label: FakemonOtherCapabilityAddingLabel.Capability5,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonOtherCapabilityAddingCustomId.Capability1]: TextInputStyle.Short,
        [FakemonOtherCapabilityAddingCustomId.Capability2]: TextInputStyle.Short,
        [FakemonOtherCapabilityAddingCustomId.Capability3]: TextInputStyle.Short,
        [FakemonOtherCapabilityAddingCustomId.Capability4]: TextInputStyle.Short,
        [FakemonOtherCapabilityAddingCustomId.Capability5]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const capability1Input = new TextInputBuilder()
            .setCustomId(FakemonOtherCapabilityAddingCustomId.Capability1)
            .setLabel(FakemonOtherCapabilityAddingLabel.Capability1)
            .setStyle(this.styleMap[FakemonOtherCapabilityAddingCustomId.Capability1])
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true);

        const capability2Input = new TextInputBuilder()
            .setCustomId(FakemonOtherCapabilityAddingCustomId.Capability2)
            .setLabel(FakemonOtherCapabilityAddingLabel.Capability2)
            .setStyle(this.styleMap[FakemonOtherCapabilityAddingCustomId.Capability2])
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(false);

        const capability3Input = new TextInputBuilder()
            .setCustomId(FakemonOtherCapabilityAddingCustomId.Capability3)
            .setLabel(FakemonOtherCapabilityAddingLabel.Capability3)
            .setStyle(this.styleMap[FakemonOtherCapabilityAddingCustomId.Capability3])
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(false);

        const capability4Input = new TextInputBuilder()
            .setCustomId(FakemonOtherCapabilityAddingCustomId.Capability4)
            .setLabel(FakemonOtherCapabilityAddingLabel.Capability4)
            .setStyle(this.styleMap[FakemonOtherCapabilityAddingCustomId.Capability4])
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(false);

        const capability5Input = new TextInputBuilder()
            .setCustomId(FakemonOtherCapabilityAddingCustomId.Capability5)
            .setLabel(FakemonOtherCapabilityAddingLabel.Capability5)
            .setStyle(this.styleMap[FakemonOtherCapabilityAddingCustomId.Capability5])
            .setMinLength(0)
            .setMaxLength(50)
            .setRequired(false);

        return [
            capability1Input,
            capability2Input,
            capability3Input,
            capability4Input,
            capability5Input,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId } = this.inputData as {
            messageId: string;
        };
        const {
            [FakemonOtherCapabilityAddingCustomId.Capability1]: capability1,
            [FakemonOtherCapabilityAddingCustomId.Capability2]: capability2,
            [FakemonOtherCapabilityAddingCustomId.Capability3]: capability3,
            [FakemonOtherCapabilityAddingCustomId.Capability4]: capability4,
            [FakemonOtherCapabilityAddingCustomId.Capability5]: capability5,
        } = this.parseInput<FakemonOtherCapabilityAddingCustomId>(interaction) as {
            [FakemonOtherCapabilityAddingCustomId.Capability1]: string;
            [FakemonOtherCapabilityAddingCustomId.Capability2]: string;
            [FakemonOtherCapabilityAddingCustomId.Capability3]: string;
            [FakemonOtherCapabilityAddingCustomId.Capability4]: string;
            [FakemonOtherCapabilityAddingCustomId.Capability5]: string;
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
            await FakemonCapabilityManagerService.addOtherCapabilities({
                messageId,
                fakemon,
                other: [
                    capability1,
                    capability2,
                    capability3,
                    capability4,
                    capability5,
                ].filter(Boolean),
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
            page: FakemonInteractionManagerPage.Capabilities,
            messageId,
        });
    }
}
