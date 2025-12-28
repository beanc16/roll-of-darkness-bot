import {
    Attachment,
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
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

interface FakemonEditGetParameterResults
{
    speciesName: string;
    image: Attachment | null;
    imageUrl: string | null;
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

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const {
            speciesName,
            // image,
            // imageUrl,
            coEditorToAdd,
            coEditorToRemove,
        } = this.getOptions(interaction);

        // Get fakemon
        const [fakemon] = await PtuFakemonPseudoCache.getByNames([speciesName], interaction.user.id);
        if (!fakemon)
        {
            await interaction.editReply({
                content: `Fakemon titled \`${speciesName}\` does not exist or you are not an editor of it.`,
            });
            return true;
        }

        // Initialize initial fakemon data
        const message = await interaction.fetchReply();
        const updatedFakemon = await this.updateCoEditors({
            fakemon,
            messageId: message.id,
            coEditorToAdd,
            coEditorToRemove,
        });

        // Send response
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.Overview,
            fakemon: updatedFakemon,
            interactionType: 'editReply',
        });

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

    private static getOptions(interaction: ChatInputCommandInteraction): FakemonEditGetParameterResults
    {
        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);
        const image = interaction.options.getAttachment('image');
        const imageUrl = interaction.options.getString('image_url');
        const coEditorToAdd = interaction.options.getUser('co_editor_to_add');
        const coEditorToRemove = interaction.options.getUser('co_editor_to_remove');

        return {
            speciesName,
            image,
            imageUrl,
            coEditorToAdd,
            coEditorToRemove,
        };
    }

    private static async updateCoEditors({
        fakemon,
        messageId,
        coEditorToAdd,
        coEditorToRemove,
    }: {
        fakemon: PtuFakemonCollection;
        messageId: string;
        coEditorToAdd: User | null;
        coEditorToRemove: User | null;
    }): Promise<PtuFakemonCollection>
    {
        if (!(coEditorToAdd || coEditorToRemove))
        {
            PtuFakemonPseudoCache.addToCache(messageId, fakemon);
            return fakemon;
        }

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

        // Editors array did not change
        if (
            fakemon.editors.length === newEditors.length
            && fakemon.editors.every((element, index) =>
                element === newEditors[index],
            )
        )
        {
            PtuFakemonPseudoCache.addToCache(messageId, fakemon);
            return fakemon;
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            editors: [],
        });
    }
}
