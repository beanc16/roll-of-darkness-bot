import { Text } from '@beanc16/discordjs-helpers';
import { type ModalSubmitInteraction } from 'discord.js';

import { BaseCustomModal } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import { FakemonCapabilityManagerService } from '../../../services/FakemonDataManagers/FakemonCapabilityManagerService.js';
import { FakemonInteractionManagerService } from '../../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';

export enum FakemonNonOtherCapabilityEditingCustomId
{
    Overland = 'fakemon-capability-editing-overland',
    Swim = 'fakemon-capability-editing-swim',
    Sky = 'fakemon-capability-editing-sky',
    Levitate = 'fakemon-capability-editing-levitate',
    Burrow = 'fakemon-capability-editing-burrow',
    HighJump = 'fakemon-capability-editing-high-jump',
    LowJump = 'fakemon-capability-editing-low-jump',
    Power = 'fakemon-capability-editing-power',
}

export enum FakemonNonOtherCapabilityEditingLabel
{
    Overland = 'Overland',
    Swim = 'Swim',
    Sky = 'Sky',
    Levitate = 'Levitate',
    Burrow = 'Burrow',
    HighJump = 'High Jump',
    LowJump = 'Low Jump',
    Power = 'Power',
}

export abstract class FakemonNonOtherCapabilityEditingModalBase extends BaseCustomModal
{
    public static title = 'Edit Capabilities';

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId } = this.inputData as {
            messageId: string;
        };
        const {
            [FakemonNonOtherCapabilityEditingCustomId.Overland]: overland,
            [FakemonNonOtherCapabilityEditingCustomId.Swim]: swim,
            [FakemonNonOtherCapabilityEditingCustomId.Sky]: sky,
            [FakemonNonOtherCapabilityEditingCustomId.Levitate]: levitate,
            [FakemonNonOtherCapabilityEditingCustomId.Burrow]: burrow,
            [FakemonNonOtherCapabilityEditingCustomId.HighJump]: highJump,
            [FakemonNonOtherCapabilityEditingCustomId.LowJump]: lowJump,
            [FakemonNonOtherCapabilityEditingCustomId.Power]: power,
        } = this.parseInput<FakemonNonOtherCapabilityEditingCustomId>(interaction) as {
            [FakemonNonOtherCapabilityEditingCustomId.Overland]?: number;
            [FakemonNonOtherCapabilityEditingCustomId.Swim]?: number;
            [FakemonNonOtherCapabilityEditingCustomId.Sky]?: number;
            [FakemonNonOtherCapabilityEditingCustomId.Levitate]?: number;
            [FakemonNonOtherCapabilityEditingCustomId.Burrow]?: number;
            [FakemonNonOtherCapabilityEditingCustomId.HighJump]?: number;
            [FakemonNonOtherCapabilityEditingCustomId.LowJump]?: number;
            [FakemonNonOtherCapabilityEditingCustomId.Power]?: number;
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
            const currentCapabilities = fakemon.capabilities;
            await FakemonCapabilityManagerService.updateNumericCapabilities({
                messageId,
                fakemon,
                capabilities: {
                    overland: overland ?? currentCapabilities.overland,
                    swim: swim ?? currentCapabilities.swim,
                    sky: sky ?? currentCapabilities.sky,
                    levitate: levitate ?? currentCapabilities.levitate,
                    burrow: burrow ?? currentCapabilities.burrow,
                    highJump: highJump ?? currentCapabilities.highJump,
                    lowJump: lowJump ?? currentCapabilities.lowJump,
                    power: power ?? currentCapabilities.power,
                },
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
