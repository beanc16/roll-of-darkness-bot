import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { FakemonViewAllActionRowBuilder, FakemonViewAllButtonCustomIds } from '../../components/fakemon/actionRowBuilders/viewMode/FakemonViewAllActionRowBuilder.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
    PtuStringSelectMenuIteractionStrategy,
} from '../../types/strategies.js';

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class FakemonViewAllStrategy
{
    public static key = PtuFakemonSubcommand.ViewAll;

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        // Get fakemon
        const fakemon = await PtuFakemonPseudoCache.getAll(interaction.user.id);
        if (fakemon.length === 0)
        {
            await interaction.editReply({
                content: `Could not find any fakemon that you're an editor of.`,
            });
            return true;
        }

        // Send response
        const embeds = this.getEmbeds(fakemon);
        await interaction.followUp({
            embeds,
            components: [
                new FakemonViewAllActionRowBuilder(fakemon, 'view'),
                new FakemonViewAllActionRowBuilder(fakemon, 'edit'),
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
        const strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.View] as unknown as PtuButtonIteractionStrategy;
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
        const { customId, values: [value1] = [] } = interaction as {
            customId: FakemonViewAllButtonCustomIds;
            values: string[];
        };

        let strategy: PtuChatIteractionStrategy;
        switch (customId)
        {
            case FakemonViewAllButtonCustomIds.FakemonView:
                strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.View] as unknown as PtuChatIteractionStrategy;
                break;

            case FakemonViewAllButtonCustomIds.FakemonEdit:
                strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Edit] as unknown as PtuChatIteractionStrategy;
                break;

            default:
                // Run edit subcommand
                const buttonStrategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.View] as unknown as PtuStringSelectMenuIteractionStrategy;
                return await buttonStrategy?.runStringSelect(
                    interaction,
                    strategies,
                    metadata,
                );
        }

        await interaction.deferUpdate();
        return await strategy?.run(
            interaction as unknown as ChatInputCommandInteraction,
            strategies,
            { speciesName: value1 },
        );
    }

    private static getEmbeds(fakemon: PtuFakemonCollection[]): EmbedBuilder[]
    {
        return getPagedEmbedMessages({
            title: 'Fakemon',
            input: fakemon,
            parseElementToLines: element => [
                `- ${element.name} (${element.status})`,
            ],
        });
    }
}
