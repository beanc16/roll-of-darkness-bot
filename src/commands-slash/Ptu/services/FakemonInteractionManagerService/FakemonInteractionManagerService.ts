import {
    ChatInputCommandInteraction,
    InteractionEditReplyOptions,
    InteractionUpdateOptions,
    Message,
    StringSelectMenuInteraction,
} from 'discord.js';

import { CommandName } from '../../../../types/discord.js';
import { getFakemonOverviewComponents, getFakemonStatsComponents } from '../../components/fakemon/actionRowData/index.js';
import { FakemonOverviewEmbedMessage } from '../../components/fakemon/embeds/FakemonOverviewEmbedMessage.js';
import { FakemonStatsEmbedMessage } from '../../components/fakemon/embeds/FakemonStatsEmbedMessage.js';
import { FakemonState } from '../../models/fakemonStateSingleton.js';

export enum FakemonInteractionManagerPage
{
    Overview = 'Overview',
    Stats = 'Stats',
}

export type FakemonInteractionManagerInteractionType = 'editReply' | 'update';

interface NavigateToOptions
{
    interaction: ChatInputCommandInteraction | StringSelectMenuInteraction;
    page: FakemonInteractionManagerPage;
    message: Message;
    commandName: CommandName;
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

    private static getInteractionOptions({
        page,
        message,
        commandName,
        state,
    }: NavigateToOptions): Pick<InteractionEditReplyOptions | InteractionUpdateOptions, 'embeds' | 'components'>
    {
        const commonArgs = {
            message,
            commandName,
            stateGuid: state.key,
        };

        switch (page)
        {
            case FakemonInteractionManagerPage.Overview:
                return {
                    embeds: [
                        new FakemonOverviewEmbedMessage(state.pokemon),
                    ],
                    components: getFakemonOverviewComponents(commonArgs),
                };

            case FakemonInteractionManagerPage.Stats:
                return {
                    embeds: [
                        new FakemonStatsEmbedMessage(state.pokemon),
                    ],
                    components: getFakemonStatsComponents(commonArgs),
                };

            default:
                const typeGuard: never = page;
                throw new Error(`Unhandled page: ${typeGuard}`);
        }
    }
}
