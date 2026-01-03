import { ButtonInteraction, ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
    PtuStringSelectMenuIteractionStrategy,
} from '../../types/strategies.js';
import { FakemonOverviewEmbedMessage } from '../../components/fakemon/embeds/FakemonOverviewEmbedMessage.js';
import { FakemonViewModeActionRowBuilder, FakemonViewModeButtonCustomIds } from '../../components/fakemon/actionRowBuilders/viewMode/FakemonViewModeActionRowBuilder.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import type { FakemonEditStrategy } from './FakemonEditStrategy.js';

interface FakemonViewGetParameterResults
{
    speciesName: string;
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class FakemonViewStrategy
{
    public static key = PtuFakemonSubcommand.View;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonViewGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonViewGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
        options?: Partial<FakemonViewGetParameterResults>,
    ): Promise<boolean>
    {
        const { speciesName } = this.getOptions(interaction as ButtonInteraction, options);

        // Get fakemon
        const [fakemon] = await PtuFakemonPseudoCache.getByNames([speciesName], interaction.user.id);
        if (!fakemon)
        {
            await interaction.editReply({
                content: `Fakemon titled \`${speciesName}\` does not exist or you are not an editor of it.`,
            });
            return true;
        }

        // Add to cache for later button interaction handling
        const message = await interaction.fetchReply();
        PtuFakemonPseudoCache.addToCache(message.id, fakemon);

        // Send response
        await interaction.followUp({
            embeds: [
                new FakemonOverviewEmbedMessage(fakemon),
            ],
            components: [
                new FakemonViewModeActionRowBuilder(),
            ],
        });

        return true;
    }

    public static async runButton(
        interaction: ButtonInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        // Defer update
        await interaction.deferUpdate();

        const { customId } = interaction as { customId: FakemonViewModeButtonCustomIds };
        const fakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        switch (customId)
        {
            case FakemonViewModeButtonCustomIds.EditMode:
                // Run edit subcommand
                const Strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Edit] as typeof FakemonEditStrategy;
                await Strategy.run(
                    interaction,
                    strategies,
                    { speciesName: fakemon.name },
                );
                break;

            default:
                // Run edit subcommand
                const strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Edit] as unknown as PtuButtonIteractionStrategy;
                return await strategy?.runButton(
                    interaction,
                    strategies,
                    metadata,
                );
        }

        return true;
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

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): FakemonViewGetParameterResults;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<FakemonViewGetParameterResults>): FakemonViewGetParameterResults;
    private static getOptions(interaction: StringSelectMenuInteraction, options?: Partial<FakemonViewGetParameterResults>): FakemonViewGetParameterResults;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        options?: FakemonViewGetParameterResults,
    ): FakemonViewGetParameterResults
    {
        if (options)
        {
            return options;
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);

        return { speciesName };
    }
}
