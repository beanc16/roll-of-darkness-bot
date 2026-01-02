import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionEditReplyOptions,
    InteractionUpdateOptions,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import {
    getFakemonBasicInformationComponents,
    getFakemonBreedingInformationComponents,
    getFakemonCapabilitiesComponents,
    getFakemonEnvironmentComponents,
    getFakemonEvolutionsComponents,
    getFakemonOverviewComponents,
    getFakemonSizeInformationComponents,
    getFakemonSkillsComponents,
    getFakemonStatsComponents,
} from '../../components/fakemon/actionRowData/index.js';
import { FakemonBasicInformationEmbedMessage } from '../../components/fakemon/embeds/FakemonBasicInformationEmbedMessage.js';
import { FakemonBreedingInformationEmbedMessage } from '../../components/fakemon/embeds/FakemonBreedingInformationEmbedMessage.js';
import { FakemonCapabilitiesEmbedMessage } from '../../components/fakemon/embeds/FakemonCapabilitiesEmbedMessage.js';
import { FakemonEnvironmentEmbedMessage } from '../../components/fakemon/embeds/FakemonEnvironmentEmbedMessage.js';
import { FakemonEvolutionsEmbedMessage } from '../../components/fakemon/embeds/FakemonEvolutionsEmbedMessage.js';
import { FakemonOverviewEmbedMessage } from '../../components/fakemon/embeds/FakemonOverviewEmbedMessage.js';
import { FakemonSizeInformationEmbedMessage } from '../../components/fakemon/embeds/FakemonSizeInformationEmbedMessage.js';
import { FakemonSkillsEmbedMessage } from '../../components/fakemon/embeds/FakemonSkillsEmbedMessage.js';
import { FakemonStatsEmbedMessage } from '../../components/fakemon/embeds/FakemonStatsEmbedMessage.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonInteractionManagerPage } from './types.js';

export type FakemonInteractionManagerInteractionType = 'editReply' | 'update';

interface NavigateToOptions
{
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction;
    page: FakemonInteractionManagerPage;
    messageId: string;
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
        const fakemon = PtuFakemonPseudoCache.getByMessageId(options.messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        const interactionOptions = this.getInteractionOptions({ page: options.page, fakemon });
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

    private static getInteractionOptions({ page, fakemon }: Pick<NavigateToOptions, 'page'> & { fakemon: PtuFakemonCollection }): Pick<InteractionEditReplyOptions | InteractionUpdateOptions, 'embeds' | 'components'>
    {
        switch (page)
        {
            case FakemonInteractionManagerPage.Overview:
                return {
                    embeds: [
                        new FakemonOverviewEmbedMessage(fakemon),
                    ],
                    components: getFakemonOverviewComponents(),
                };

            case FakemonInteractionManagerPage.Stats:
                return {
                    embeds: [
                        new FakemonStatsEmbedMessage(fakemon),
                    ],
                    components: getFakemonStatsComponents(),
                };

            case FakemonInteractionManagerPage.BasicInformation:
                return {
                    embeds: [
                        new FakemonBasicInformationEmbedMessage(fakemon),
                    ],
                    components: getFakemonBasicInformationComponents(fakemon),
                };

            case FakemonInteractionManagerPage.Evolutions:
                return {
                    embeds: [
                        new FakemonEvolutionsEmbedMessage(fakemon),
                    ],
                    components: getFakemonEvolutionsComponents(fakemon),
                };

            case FakemonInteractionManagerPage.SizeInformation:
                return {
                    embeds: [
                        new FakemonSizeInformationEmbedMessage(fakemon),
                    ],
                    components: getFakemonSizeInformationComponents(),
                };

            case FakemonInteractionManagerPage.BreedingInformation:
                return {
                    embeds: [
                        new FakemonBreedingInformationEmbedMessage(fakemon),
                    ],
                    components: getFakemonBreedingInformationComponents(fakemon),
                };

            case FakemonInteractionManagerPage.Environment:
                return {
                    embeds: [
                        new FakemonEnvironmentEmbedMessage(fakemon),
                    ],
                    components: getFakemonEnvironmentComponents(fakemon),
                };

            case FakemonInteractionManagerPage.Capabilities:
                return {
                    embeds: [
                        new FakemonCapabilitiesEmbedMessage(fakemon),
                    ],
                    components: getFakemonCapabilitiesComponents(fakemon),
                };

            case FakemonInteractionManagerPage.Skills:
                return {
                    embeds: [
                        new FakemonSkillsEmbedMessage(fakemon),
                    ],
                    components: getFakemonSkillsComponents(),
                };

            default:
                const typeGuard: never = page;
                throw new Error(`Unhandled page: ${typeGuard}`);
        }
    }
}
