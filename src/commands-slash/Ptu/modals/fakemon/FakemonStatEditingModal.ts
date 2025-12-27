import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { FakemonStatsStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsStringSelectActionRowBuilder.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';

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
            statToEdit: FakemonStatsStringSelectElementOptions;
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
        const statKey = this.getStatKey(statToEdit);
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

    public static getStatKey(statToEdit: FakemonStatsStringSelectElementOptions): keyof PtuFakemonCollection['baseStats']
    {
        switch (statToEdit)
        {
            case FakemonStatsStringSelectElementOptions.HP:
                return 'hp';
            case FakemonStatsStringSelectElementOptions.Attack:
                return 'attack';
            case FakemonStatsStringSelectElementOptions.Defense:
                return 'defense';
            case FakemonStatsStringSelectElementOptions.SpecialAttack:
                return 'specialAttack';
            case FakemonStatsStringSelectElementOptions.SpecialDefense:
                return 'specialDefense';
            case FakemonStatsStringSelectElementOptions.Speed:
                return 'speed';
            default:
                const typeCheck: never = statToEdit;
                throw new Error(`Unhandled statToEdit: ${typeCheck}`);
        }
    }
}
