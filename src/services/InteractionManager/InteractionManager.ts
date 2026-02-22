import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { InteractionManagerPage } from './InteractionManagerPage.js';

export type InteractionManagerInteractionType = 'editReply' | 'update' | 'followUp';

export type InteractionManagerNavigateToOptions<InteractionManagerPageEnum, AdditionalData extends Record<string, string | object | undefined>> = {
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction;
    page: InteractionManagerPageEnum;
    interactionType?: InteractionManagerInteractionType;
} & AdditionalData;

export abstract class InteractionManager
{
    protected static async sendMessage<
        InteractionManagerPageEnum extends string,
        AdditionalData extends Record<string, string | object>,
    >(
        options: InteractionManagerNavigateToOptions<InteractionManagerPageEnum, AdditionalData>,
        page: InteractionManagerPage,
    ): Promise<void>
    {
        const { interaction, interactionType = 'editReply' } = options;

        switch (interactionType)
        {
            case 'editReply':
                await interaction.editReply(page);
                break;

            case 'update':
                await (interaction as StringSelectMenuInteraction).update(page);
                break;

            case 'followUp':
                await interaction.followUp(page);
                break;

            default:
                const typeGuard: never = interactionType;
                throw new Error(`Unhandled interactionType: ${typeGuard}`);
        }
    }
}
