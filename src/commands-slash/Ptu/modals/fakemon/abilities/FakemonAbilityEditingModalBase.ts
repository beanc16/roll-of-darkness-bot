import { Text } from '@beanc16/discordjs-helpers';
import { type ModalSubmitInteraction } from 'discord.js';

import { BaseCustomModal } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import { FakemonBasicInformationManagerService } from '../../../services/FakemonDataManagers/FakemonBasicInformationManagerService.js';
import { FakemonInteractionManagerService } from '../../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';

export enum FakemonAbilityEditingCustomId
{
    BasicAbility1 = 'fakemon-ability-editing-basic-ability-1',
    BasicAbility2 = 'fakemon-ability-editing-basic-ability-2',
    AdvancedAbility1 = 'fakemon-ability-editing-advanced-ability-1',
    AdvancedAbility2 = 'fakemon-ability-editing-advanced-ability-2',
    AdvancedAbility3 = 'fakemon-ability-editing-advanced-ability-3',
    HighAbility = 'fakemon-ability-editing-high-ability',
}

export enum FakemonAbilityEditingLabel
{
    BasicAbility1 = 'Basic Ability 1',
    BasicAbility2 = 'Basic Ability 2',
    AdvancedAbility1 = 'Advanced Ability 1',
    AdvancedAbility2 = 'Advanced Ability 2',
    AdvancedAbility3 = 'Advanced Ability 3',
    HighAbility = 'High Ability',
}

export abstract class FakemonAbilityEditingModalBase extends BaseCustomModal
{
    public static title = 'Edit Abilities';

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId } = this.inputData as {
            messageId: string;
        };
        const {
            [FakemonAbilityEditingCustomId.BasicAbility1]: basicAbility1,
            [FakemonAbilityEditingCustomId.BasicAbility2]: basicAbility2,
            [FakemonAbilityEditingCustomId.AdvancedAbility1]: advancedAbility1,
            [FakemonAbilityEditingCustomId.AdvancedAbility2]: advancedAbility2,
            [FakemonAbilityEditingCustomId.AdvancedAbility3]: advancedAbility3,
            [FakemonAbilityEditingCustomId.HighAbility]: highAbility,
        } = this.parseInput<FakemonAbilityEditingCustomId>(interaction) as {
            [FakemonAbilityEditingCustomId.BasicAbility1]: string;
            [FakemonAbilityEditingCustomId.BasicAbility2]?: string;
            [FakemonAbilityEditingCustomId.AdvancedAbility1]: string;
            [FakemonAbilityEditingCustomId.AdvancedAbility2]: string;
            [FakemonAbilityEditingCustomId.AdvancedAbility3]?: string;
            [FakemonAbilityEditingCustomId.HighAbility]: string;
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
        const basicAbilities = [basicAbility1, basicAbility2].filter(element => !!element) as string[];
        const advancedAbilities = [advancedAbility1, advancedAbility2, advancedAbility3].filter(element => !!element) as string[];

        try
        {
            await FakemonBasicInformationManagerService.setAbilities({
                messageId,
                fakemon,
                abilities: {
                    ...(basicAbilities.length > 0 && { basicAbilities }),
                    ...(advancedAbilities.length > 0 && { advancedAbilities }),
                    ...(highAbility && { highAbility }),
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
            page: FakemonInteractionManagerPage.BasicInformation,
            messageId,
        });
    }
}
