import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionEditReplyOptions,
    InteractionUpdateOptions,
    StringSelectMenuInteraction,
} from 'discord.js';

import { getFakemonOverviewComponents, getFakemonStatsComponents } from '../../components/fakemon/actionRowData/index.js';
import { FakemonOverviewEmbedMessage } from '../../components/fakemon/embeds/FakemonOverviewEmbedMessage.js';
import { FakemonStatsEmbedMessage } from '../../components/fakemon/embeds/FakemonStatsEmbedMessage.js';
import type { FakemonState } from '../../models/fakemonStateSingleton.js';
import { FakemonInteractionManagerPage } from './types.js';

export type FakemonInteractionManagerInteractionType = 'editReply' | 'update';

interface NavigateToOptions
{
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;
    page: FakemonInteractionManagerPage;
    state: FakemonState;
    interactionType?: FakemonInteractionManagerInteractionType;
}

/**
 * Service for handling interaction updates for the fakemon
 * subcommand group. This consolidates the navigation logic
 * so that the embeds and components for each possible
 * navigation action remain consistent.
 */
export class FakemonInteractionManagerService
{
    public static async navigateTo(options: NavigateToOptions): Promise<void>
    {
        const interactionOptions = this.getInteractionOptions(options);
        const { interaction, interactionType = 'editReply' } = options;

        switch (interactionType)
        {
            case 'editReply':
                await interaction.editReply(interactionOptions);
                break;

            case 'update':
                await (interaction as StringSelectMenuInteraction).update(interactionOptions);
                break;

            default:
                const typeGuard: never = interactionType;
                throw new Error(`Unhandled interactionType: ${typeGuard}`);
        }
    }

    private static getInteractionOptions({ page, state }: NavigateToOptions): Pick<InteractionEditReplyOptions | InteractionUpdateOptions, 'embeds' | 'components'>
    {
        switch (page)
        {
            case FakemonInteractionManagerPage.Overview:
                return {
                    embeds: [
                        new FakemonOverviewEmbedMessage(state.pokemon),
                    ],
                    components: getFakemonOverviewComponents(),
                };

            case FakemonInteractionManagerPage.Stats:
                return {
                    embeds: [
                        new FakemonStatsEmbedMessage(state.pokemon),
                    ],
                    components: getFakemonStatsComponents(),
                };

            default:
                const typeGuard: never = page;
                throw new Error(`Unhandled page: ${typeGuard}`);
        }
    }
}
