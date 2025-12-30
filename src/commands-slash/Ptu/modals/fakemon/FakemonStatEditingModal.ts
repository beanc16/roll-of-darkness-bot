import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { FakemonStatsEditStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonStatManagerService } from '../../services/FakemonDataManagers/FakemonStatManagerService.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';

enum FakemonStatEditingCustomId
{
    Stat = 'fakemon-stat-editing-text-input',
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
        [FakemonStatEditingCustomId.Stat]: [
            {
                key: FakemonStatEditingCustomId.Stat,
                label: FakemonStatEditingLabel.Stat,
                value: '',
                typeOfValue: 'integer',
            },
        ],
    };

    protected static styleMap = {
        [FakemonStatEditingCustomId.Stat]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const promptInput = new TextInputBuilder()
            .setCustomId(FakemonStatEditingCustomId.Stat)
            .setLabel(FakemonStatEditingLabel.Stat)
            .setStyle(this.styleMap[FakemonStatEditingCustomId.Stat])
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
            [FakemonStatEditingCustomId.Stat]: stat,
        } = this.parseInput<FakemonStatEditingCustomId>(interaction) as {
            [FakemonStatEditingCustomId.Stat]: number;
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
            await FakemonStatManagerService.setStat({
                messageId,
                fakemon,
                stat,
                statToEdit,
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
            page: FakemonInteractionManagerPage.Stats,
            messageId,
        });
    }
}
