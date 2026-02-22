import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuFakemonCollection, PtuFakemonDexType } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';
import { HomebrewPokeApi } from '../../services/HomebrewPokeApi/HomebrewPokeApi.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
    PtuStringSelectMenuIteractionStrategy,
} from '../../types/strategies.js';

interface FakemonEditGetParameterResults
{
    speciesName: string;
    region: PtuFakemonDexType | null;
    processedImageUrl: string | null;
    coEditorToAdd: User | null;
    coEditorToRemove: User | null;
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class FakemonEditStrategy
{
    public static key = PtuFakemonSubcommand.Edit;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonEditGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonEditGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
        options?: Partial<FakemonEditGetParameterResults>,
    ): Promise<boolean>
    {
        const {
            speciesName,
            region,
            processedImageUrl,
            coEditorToAdd,
            coEditorToRemove,
        } = this.getOptions(interaction as ButtonInteraction, options);

        // Get fakemon
        const [fakemon] = await PtuFakemonPseudoCache.getByNames([speciesName], interaction.user.id);
        if (!fakemon)
        {
            await interaction.editReply({
                content: `Fakemon titled \`${speciesName}\` does not exist or you are not an editor of it.`,
            });
            return true;
        }

        // Update fakemon data
        const message = await interaction.fetchReply();
        const updatedImageUrl = await this.updateUploadedFakemonImage(speciesName, processedImageUrl);
        await this.updateFakemon({
            fakemon,
            messageId: message.id,
            region,
            coEditorToAdd,
            coEditorToRemove,
            updatedImageUrl,
        });

        // Send response
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.Overview,
            messageId: message.id,
            interactionType: 'editReply',
        });

        // If there was an error uploading the image, send a follow up
        if (processedImageUrl && !updatedImageUrl)
        {
            await interaction.followUp({
                content: 'An error occurred while uploading the image. Please try again with the edit command.',
                ephemeral: true,
            });
        }

        return true;
    }

    public static async runButton(
        interaction: ButtonInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        const strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Create] as unknown as PtuButtonIteractionStrategy;
        return await strategy?.runButton(
            interaction,
            strategies,
            metadata,
        );
    }

    public static async runStringSelect(
        interaction: StringSelectMenuInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        const strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Create] as unknown as PtuStringSelectMenuIteractionStrategy;
        return await strategy?.runStringSelect(
            interaction,
            strategies,
            metadata,
        );
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): FakemonEditGetParameterResults;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<FakemonEditGetParameterResults>): FakemonEditGetParameterResults;
    private static getOptions(interaction: StringSelectMenuInteraction, options?: Partial<FakemonEditGetParameterResults>): FakemonEditGetParameterResults;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        options?: FakemonEditGetParameterResults,
    ): FakemonEditGetParameterResults
    {
        if (options)
        {
            return options;
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);
        const region = interaction.options.getString('region') as PtuFakemonDexType | null;
        const image = interaction.options.getAttachment('image');
        const imageUrl = interaction.options.getString('image_url');
        const coEditorToAdd = interaction.options.getUser('co_editor_to_add');
        const coEditorToRemove = interaction.options.getUser('co_editor_to_remove');

        const processedImageUrl = image?.url ?? imageUrl;

        return {
            speciesName,
            region,
            processedImageUrl,
            coEditorToAdd,
            coEditorToRemove,
        };
    }

    private static async updateFakemon({
        fakemon,
        messageId,
        region,
        coEditorToAdd,
        coEditorToRemove,
        updatedImageUrl,
    }: {
        fakemon: PtuFakemonCollection;
        messageId: string;
        region: PtuFakemonDexType | null;
        coEditorToAdd: User | null;
        coEditorToRemove: User | null;
        updatedImageUrl?: string;
    }): Promise<PtuFakemonCollection>
    {
        if (!(region || coEditorToAdd || coEditorToRemove || updatedImageUrl))
        {
            PtuFakemonPseudoCache.addToCache(messageId, fakemon);
            return fakemon;
        }

        const shouldUpdateDexType = !!region && region !== fakemon.dexType;
        const newRegionName = region || fakemon.dexType;

        const newEditors = [
            // Only keep unique editors
            ...new Set(
                [
                    // Add coEditorToAdd
                    ...fakemon.editors,
                    coEditorToAdd?.id,
                ].filter(element =>
                    // Remove coEditorToRemove
                    element && (!coEditorToRemove || element !== coEditorToRemove.id),
                ) as string[],
            ),
        ];

        // None of the input values changed
        if (
            fakemon.editors.length === newEditors.length
            && fakemon.editors.every((element, index) =>
                element === newEditors[index],
            )
            && !updatedImageUrl
            && !shouldUpdateDexType
        )
        {
            PtuFakemonPseudoCache.addToCache(messageId, fakemon);
            return fakemon;
        }

        const updatedFakemon = await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            ...(shouldUpdateDexType && { dexType: region }),
            editors: newEditors,
            metadata: {
                ...fakemon.metadata,
                ...(shouldUpdateDexType && { source: `${newRegionName} Dex` }),
                imageUrl: updatedImageUrl || fakemon.metadata.imageUrl,
            },
        });
        PtuFakemonPseudoCache.addToCache(messageId, updatedFakemon);
        return updatedFakemon;
    }

    private static async updateUploadedFakemonImage(speciesName: string, imageUrl: string | null): Promise<string | undefined>
    {
        if (!imageUrl)
        {
            return undefined;
        }

        return await HomebrewPokeApi.uploadFakemonImage({
            speciesName,
            imageUrl,
            isCreate: false,
        });
    }
}
