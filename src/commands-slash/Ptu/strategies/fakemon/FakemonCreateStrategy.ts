import {
    Attachment,
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiscordUserId } from '../../../../types/discord.js';
import { FakemonStatsElementOptions } from '../../components/fakemon/actionRowBuilders/FakemonStatsActionRowBuilder.js';
import { fakemonBackToOverviewButtonCustomId } from '../../components/fakemon/button/FakemonBackToOverviewButton.js';
import { FakemonTopLevelSelectorCustomIds } from '../../components/fakemon/types.js';
import { PtuFakemonCollection, PtuFakemonStatus } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache, PtuFakemonToCreate } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonStatEditingModal } from '../../modals/fakemon/FakemonStatEditingModal.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
    PtuStringSelectMenuIteractionStrategy,
} from '../../types/strategies.js';

interface FakemonCreateGetParameterResults
{
    speciesName: string;
    baseSpeciesOn: string | null;
    baseMovesOn: string | null;
    baseAbilitiesOn: string | null;
    image: Attachment | null;
    imageUrl: string | null;
    coEditor: User | null;
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class FakemonCreateStrategy
{
    public static key = PtuFakemonSubcommand.Create;

    private static basePokemon: Omit<PtuFakemonToCreate, 'creationChannelId'> = {
        name: '',
        types: [],
        baseStats: {
            hp: 0,
            attack: 0,
            defense: 0,
            specialAttack: 0,
            specialDefense: 0,
            speed: 0,
        },
        moveList: {
            levelUp: [],
            tmHm: [],
            eggMoves: [],
            tutorMoves: [],
        },
        abilities: {
            basicAbilities: ['PLACEHOLDER', 'PLACEHOLDER'],
            advancedAbilities: ['PLACEHOLDER', 'PLACEHOLDER'],
            highAbility: 'PLACEHOLDER',
        },
        evolution: [{
            level: 1,
            name: '',
            stage: 1,
        }],
        capabilities: {
            overland: 0,
            swim: 0,
            sky: 0,
            levitate: 0,
            burrow: 0,
            highJump: 0,
            lowJump: 0,
            power: 0,
            other: [],
        },
        sizeInformation: {
            height: {
                freedom: `0'0"`,
                metric: '0m',
                ptu: '0',
            },
            weight: {
                freedom: '0lbs',
                metric: '0kg',
                ptu: 0,
            },
        },
        breedingInformation: {
            genderRatio: { none: true },
            eggGroups: [],
        },
        diets: ['PLACEHOLDER'],
        habitats: ['PLACEHOLDER'],
        skills: {
            acrobatics: '2d6+0',
            athletics: '2d6+0',
            combat: '2d6+0',
            stealth: '2d6+0',
            perception: '2d6+0',
            focus: '2d6+0',
        },
        metadata: {
            source: 'Eden Dex',
        },
        megaEvolutions: [],
        editors: [DiscordUserId.Bean],
        status: PtuFakemonStatus.DRAFT,
        feedbacks: [],
    };

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const {
            speciesName,
            // baseSpeciesOn,
            // baseMovesOn,
            // baseAbilitiesOn,
            // image,
            // imageUrl,
            coEditor,
        } = this.getOptions(interaction);
        const message = await interaction.fetchReply();
        const state = await this.initializeFakemon({
            speciesName,
            messageId: message.id,
            creationChannelId: interaction.channelId,
            coEditorUserId: coEditor?.id,
        });

        // Send response
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.Overview,
            fakemon: state,
            interactionType: 'editReply',
        });

        return true;
    }

    public static async runButton(
        interaction: ButtonInteraction,
        _strategies: PtuStrategyMap,
        _metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        // Defer update
        await interaction.deferUpdate();

        const { customId } = interaction as {
            customId: typeof fakemonBackToOverviewButtonCustomId;
        };
        const fakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        switch (customId)
        {
            // Back to overview
            case fakemonBackToOverviewButtonCustomId:
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.Overview,
                    fakemon,
                });
                break;

            default:
                const typeGuard: never = customId;
                throw new Error(`Unhandled customId: ${typeGuard}`);
        }

        return true;
    }

    public static async runStringSelect(
        interaction: StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
        { message }: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        const { customId, values: [value] = [] } = interaction as {
            customId: FakemonTopLevelSelectorCustomIds.Overview;
            values: FakemonInteractionManagerPage[];
        } | {
            customId: FakemonTopLevelSelectorCustomIds.Stats;
            values: FakemonStatsElementOptions[];
        };
        const fakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        switch (customId)
        {
            // Navigation selector
            case FakemonTopLevelSelectorCustomIds.Overview:
                await interaction.deferUpdate(); // Defer for navigation
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: value as FakemonInteractionManagerPage,
                    fakemon,
                });
                break;

            // Stat selector
            case FakemonTopLevelSelectorCustomIds.Stats:
                const statKey = FakemonStatEditingModal.getStatKey(value as FakemonStatsElementOptions);
                // Don't defer before showing a modal, as that will throw an error
                await FakemonStatEditingModal.showModal(interaction, {
                    messageId: message.id,
                    statToEdit: value as FakemonStatsElementOptions,
                    // Add default value if stat is not 0
                    stat: fakemon.baseStats[statKey],
                });
                break;

            default:
                const typeGuard: never = customId;
                throw new Error(`Unhandled customId: ${typeGuard}`);
        }

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction): FakemonCreateGetParameterResults
    {
        const speciesName = interaction.options.getString('species_name', true);
        const baseSpeciesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseSpeciesOn);
        const baseMovesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseMovesOn);
        const baseAbilitiesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseAbilitiesOn);
        const image = interaction.options.getAttachment('image');
        const imageUrl = interaction.options.getString('image_url');
        const coEditor = interaction.options.getUser('co_editor');

        return {
            speciesName,
            baseSpeciesOn,
            baseMovesOn,
            baseAbilitiesOn,
            image,
            imageUrl,
            coEditor,
        };
    }

    private static async initializeFakemon({
        speciesName,
        messageId,
        creationChannelId,
        coEditorUserId,
    }: {
        speciesName: string;
        messageId: string;
        creationChannelId: string;
        coEditorUserId?: string;
    }): Promise<PtuFakemonCollection>
    {
        return await PtuFakemonPseudoCache.create(messageId, {
            ...this.basePokemon,
            name: speciesName,
            evolution: [{
                level: 1,
                name: speciesName,
                stage: 1,
            }],
            creationChannelId,
            editors: coEditorUserId
                ? [...new Set([...this.basePokemon.editors, coEditorUserId])]
                : this.basePokemon.editors,
        });
    }
}
