import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { PtuFakemonDexType } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonDexNumberPrefix } from '../../services/FakemonDataManagers/FakemonGeneralInformationManagerService.js';
import { FakemonOverviewManagerService } from '../../services/FakemonDataManagers/FakemonOverviewManagerService.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';

enum FakemonDexNumberEditingCustomId
{
    DexNumber = 'fakemon-dex-number-editing-text-input',
}

enum FakemonDexNumberEditingLabel
{
    DexNumber = 'Dex Number',
}

export class FakemonDexNumberEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-edit-dex-number-modal';
    public static title = 'Edit Dex Number';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonDexNumberEditingCustomId.DexNumber]: [
            {
                key: FakemonDexNumberEditingCustomId.DexNumber,
                label: FakemonDexNumberEditingLabel.DexNumber,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonDexNumberEditingCustomId.DexNumber]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const promptInput = new TextInputBuilder()
            .setCustomId(FakemonDexNumberEditingCustomId.DexNumber)
            .setLabel(FakemonDexNumberEditingLabel.DexNumber)
            .setStyle(this.styleMap[FakemonDexNumberEditingCustomId.DexNumber])
            .setMinLength(1)
            .setMaxLength(20)
            .setRequired(true);

        const typedInputData = this.inputData as Partial<Record<'dexNumber', string>>;
        if (
            typedInputData?.dexNumber
            && typeof typedInputData.dexNumber === 'string'
            && typedInputData?.dexNumber?.length > 0
        )
        {
            // Strip prefix & set to input
            const initialPrefixes = Object.values(FakemonDexNumberPrefix).reverse(); // Reverse so longer prefixes apply first
            const prefixes = initialPrefixes.map((prefix) => `${prefix}-`).concat(...initialPrefixes); // Non-numerical prefixes get a "-" that needs removed too
            let { dexNumber } = typedInputData;
            prefixes.forEach((prefix) =>
            {
                // Remove any prefix
                dexNumber = dexNumber.replace(prefix, '');
            });
            promptInput.setValue(dexNumber);
        }

        return [promptInput];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId, dexType } = this.inputData as { messageId: string; dexType: PtuFakemonDexType };
        const {
            [FakemonDexNumberEditingCustomId.DexNumber]: dexNumber,
        } = this.parseInput<FakemonDexNumberEditingCustomId>(interaction) as {
            [FakemonDexNumberEditingCustomId.DexNumber]: string;
        };

        // Get fakemon
        const fakemon = PtuFakemonPseudoCache.getByMessageId(messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // Defer update to allow for database transaction
        await interaction.deferUpdate();

        try
        {
            await FakemonOverviewManagerService.setDexNumber({
                messageId,
                fakemon,
                dexType,
                dexNumber,
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
            page: FakemonInteractionManagerPage.Overview,
            messageId,
        });
    }
}
