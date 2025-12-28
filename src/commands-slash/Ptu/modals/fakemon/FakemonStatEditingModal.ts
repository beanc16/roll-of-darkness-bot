import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { FakemonStatsEditStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';
import { FakemonStatManagerService } from '../../services/FakemonDataManagers/FakemonStatManagerService.js';

enum FakemonStatEditingCustomId
{
    stat = 'fakemon-stat-editing-text-input',
}

enum FakemonStatEditingLabel
{
    Stat = 'Stat',
}

export class FakemonStatEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-edit-stat-modal';
    public static title = 'Edit Stat';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonStatEditingCustomId.stat]: [
            {
                key: FakemonStatEditingCustomId.stat,
                label: FakemonStatEditingLabel.Stat,
                value: '',
                typeOfValue: 'integer',
            },
        ],
    };

    protected static styleMap = {
        [FakemonStatEditingCustomId.stat]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const promptInput = new TextInputBuilder()
            .setCustomId(FakemonStatEditingCustomId.stat)
            .setLabel(FakemonStatEditingLabel.Stat)
            .setStyle(this.styleMap[FakemonStatEditingCustomId.stat])
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true);

        const typedInputData = this.inputData as Partial<Record<'stat', number>>;
        if (typedInputData?.stat && typedInputData?.stat?.toString())
        {
            promptInput.setValue(typedInputData.stat.toString());
        }

        return [promptInput];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId, statToEdit } = this.inputData as {
            messageId: string;
            statToEdit: FakemonStatsEditStringSelectElementOptions;
        };
        const {
            [FakemonStatEditingCustomId.stat]: stat,
        } = this.parseInput<FakemonStatEditingCustomId>(interaction) as {
            [FakemonStatEditingCustomId.stat]: {
                [FakemonStatEditingCustomId.stat]: number;
            };
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
        const statKey = FakemonStatManagerService.getStatKey(statToEdit);
        const updatedFakemon = await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            baseStats: {
                ...fakemon.baseStats,
                [statKey]: stat,
            },
        });

        // Update message
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.Stats,
            fakemon: updatedFakemon,
        });
    }
}
